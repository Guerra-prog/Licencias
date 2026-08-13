import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// POST /api/orders/checkout
export const createCheckout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { licenseId } = req.body;
    const userId = req.user!.id;

    // Verificar que la licencia existe y está activa
    const license = await prisma.license.findUnique({
      where: { id: licenseId, active: true },
      include: { grade: true, prerequisite: true },
    });
    if (!license) throw createError('Licencia no encontrada', 404);

    // Verificar que el usuario no ya tenga esa licencia activa
    const existingLicense = await prisma.userLicense.findFirst({
      where: {
        userId,
        licenseId,
        expiresAt: { gte: new Date() },
      },
    });
    if (existingLicense) {
      throw createError('Ya tienes esta licencia activa', 400);
    }

    // Verificar requisito previo
    if (license.prerequisiteId) {
      const hasPrerequisite = await prisma.userLicense.findFirst({
        where: {
          userId,
          licenseId: license.prerequisiteId,
          expiresAt: { gte: new Date() },
        },
      });
      if (!hasPrerequisite) {
        throw createError(
          `Debes tener la licencia "${license.prerequisite?.name}" vigente para adquirir esta`,
          400
        );
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Crear Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user!.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: license.name,
              description: `${license.grade.name} - Vigencia: ${license.durationDays} días`,
            },
            unit_amount: Math.round(license.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        licenseId,
      },
      success_url: `${process.env.FRONTEND_URL}/dashboard?purchase=success`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
    });

    // Crear registro de compra en estado PENDING
    await prisma.purchase.create({
      data: {
        userId,
        licenseId,
        amount: license.price,
        currency: 'usd',
        status: 'PENDING',
        stripeSessionId: session.id,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/me
export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.purchase.findMany({
      where: { userId: req.user!.id },
      include: {
        license: { include: { grade: true } },
        userLicense: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
