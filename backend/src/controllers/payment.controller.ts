import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import { getStripe } from '../config/stripe';
import { env } from '../config/env';
import { prisma } from '../utils/prisma';

export async function checkout(req: Request, res: Response, next: NextFunction) {
  try {
    const { enrollmentId } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { license: true, combo: true },
    });
    if (!enrollment) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }
    if (enrollment.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'La inscripción no pertenece al usuario autenticado' });
    }
    if (enrollment.estado !== 'pendiente') {
      return res.status(400).json({ error: 'La inscripción ya fue pagada o está en curso' });
    }

    const producto = enrollment.license || enrollment.combo;
    if (!producto) {
      return res.status(400).json({ error: 'La inscripción no tiene producto asociado' });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cop',
            product_data: { name: producto.nombre },
            // Stripe usa centavos para COP
            unit_amount: producto.precioTotal * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { enrollmentId: enrollment.id },
      success_url: `${env.frontendUrl}/pago/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.frontendUrl}/pago/cancelado`,
    });

    await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        monto: producto.precioTotal,
        metodoPago: 'stripe',
        estado: 'pendiente',
        referenciaTransaccion: session.id,
      },
    });

    return res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    return next(err);
  }
}

export async function webhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Falta la firma de Stripe' });
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(
        req.body,
        signature,
        env.stripe.webhookSecret
      );
    } catch {
      return res.status(400).json({ error: 'Firma de webhook inválida' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const enrollmentId = session.metadata?.enrollmentId;

      if (enrollmentId) {
        await prisma.$transaction([
          prisma.payment.updateMany({
            where: { referenciaTransaccion: session.id },
            data: { estado: 'aprobado' },
          }),
          prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { estado: 'pagado' },
          }),
        ]);
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.payment.updateMany({
        where: { referenciaTransaccion: session.id },
        data: { estado: 'rechazado' },
      });
    }

    return res.json({ received: true });
  } catch (err) {
    return next(err);
  }
}
