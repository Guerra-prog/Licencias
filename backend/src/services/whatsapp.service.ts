import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

export const sendWhatsAppMessage = async (
  to: string,
  body: string
): Promise<string | null> => {
  try {
    const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const message = await client.messages.create({
      from,
      to: toFormatted,
      body,
    });
    return message.sid;
  } catch (error) {
    console.error('[WhatsApp] Error al enviar mensaje:', error);
    return null;
  }
};

export const sendPurchaseWhatsApp = async (
  phone: string,
  name: string,
  licenseName: string,
  code: string,
  expiresAt: Date
): Promise<void> => {
  const expiry = expiresAt.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const body = `🎉 *¡Felicitaciones, ${name}!*

Tu licencia *${licenseName}* ha sido emitida exitosamente.

🔑 *Código de verificación:* \`${code}\`
📅 *Válida hasta:* ${expiry}

Descarga tu PDF desde tu panel en: ${process.env.FRONTEND_URL}/dashboard

_Licencias Platform_`;

  await sendWhatsAppMessage(phone, body);
};

export const sendExpiryWhatsApp = async (
  phone: string,
  name: string,
  licenseName: string,
  daysLeft: number
): Promise<void> => {
  const body = `⚠️ *Aviso de vencimiento*

Hola ${name}, tu licencia *${licenseName}* vence en *${daysLeft} días*.

Renuévala ahora para mantener tu certificación activa:
${process.env.FRONTEND_URL}/licenses

_Licencias Platform_`;

  await sendWhatsAppMessage(phone, body);
};

export const validateTwilioSignature = (
  signature: string,
  url: string,
  params: Record<string, string>
): boolean => {
  try {
    return twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      url,
      params
    );
  } catch {
    return false;
  }
};
