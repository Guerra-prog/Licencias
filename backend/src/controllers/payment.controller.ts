import { Request, Response } from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { generateLicensePDF } from '../services/pdf.service';
import { sendPurchaseConfirmationEmail } from '../services/email.service';
import { sendPurchaseWhatsApp } from '../services/whatsapp.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    res.status(400).json({ error: 'Webhook signature invalid' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;

    await handleSuccessfulPayment(session);
  }

  res.json({ received: true });
};

async function handleSuccessfulPayment(session: Stripe.CheckoutSession): Promise<void> {
  const { userId, licenseId } = session.metadata as { userId: string; licenseId: string };

  try {
    // Actualizar la compra a COMPLETED
    const purchase = await prisma.purchase.updateMany({
      where: { stripeSessionId: session.id, status: 'PENDING' },
      data: {
        status: 'COMPLETED',
        stripePaymentId: session.payment_intent as string,
      },
    });

    if (purchase.count === 0) {
      console.warn(`[Stripe] No pending purchase found for session ${session.id}`);
      return;
    }

    const purchaseRecord = await prisma.purchase.findFirst({
      where: { stripeSessionId: session.id },
    });

    if (!purchaseRecord) return;

    // Cargar datos de licencia y usuario
    const [user, license] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.license.findUnique({
        where: { id: licenseId },
        include: { grade: true },
      }),
    ]);

    if (!user || !license) return;

    // Generar código único
    const code = `LIC-${uuidv4().substring(0, 8).toUpperCase()}`;
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + license.durationDays * 24 * 60 * 60 * 1000);

    // Generar PDF
    const pdfBuffer = await generateLicensePDF({
      userName: user.name,
      userEmail: user.email,
      licenseName: license.name,
      gradeLevel: license.grade.name,
      gradeColor: license.grade.color,
      code,
      issuedAt,
      expiresAt,
    });

    // Crear UserLicense
    await prisma.userLicense.create({
      data: {
        userId,
        licenseId,
        purchaseId: purchaseRecord.id,
        code,
        issuedAt,
        expiresAt,
      },
    });

    // Enviar email con PDF
    await sendPurchaseConfirmationEmail(
      user.email,
      user.name,
      code,
      license.name,
      expiresAt,
      pdfBuffer
    );

    // Enviar WhatsApp si tiene teléfono
    if (user.phone) {
      await sendPurchaseWhatsApp(user.phone, user.name, license.name, code, expiresAt);
    }

    console.log(`[Stripe] ✅ Licencia emitida: ${code} para usuario ${userId}`);
  } catch (error) {
    console.error('[Stripe] Error procesando pago:', error);
  }
}
