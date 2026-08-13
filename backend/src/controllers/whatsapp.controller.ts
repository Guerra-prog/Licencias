import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { validateTwilioSignature } from '../services/whatsapp.service';

// POST /api/webhook/whatsapp
export const receiveMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar firma de Twilio en producción
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers['x-twilio-signature'] as string;
      const url = `${process.env.APP_URL}/api/webhook/whatsapp`;
      const isValid = validateTwilioSignature(signature, url, req.body);

      if (!isValid) {
        res.status(403).send('Forbidden');
        return;
      }
    }

    const {
      From: from,
      Body: body,
      MessageSid: twilioSid,
    } = req.body as Record<string, string>;

    if (!from || !body) {
      res.status(400).send('Bad Request');
      return;
    }

    // Extraer número de teléfono (quitar "whatsapp:")
    const phone = from.replace('whatsapp:', '');

    // Buscar usuario por teléfono
    const user = await prisma.user.findFirst({
      where: { phone },
    });

    // Buscar o crear conversación
    let conversation = await prisma.whatsAppConversation.findFirst({
      where: { phone },
    });

    if (!conversation) {
      conversation = await prisma.whatsAppConversation.create({
        data: {
          phone,
          userId: user?.id || null,
        },
      });
    }

    // Guardar mensaje entrante
    await prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        body,
        direction: 'INBOUND',
        twilioSid,
      },
    });

    console.log(`[WhatsApp] Mensaje recibido de ${phone}: ${body.substring(0, 50)}...`);

    // Responder con TwiML vacío (sin auto-reply)
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
