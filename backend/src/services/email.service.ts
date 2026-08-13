import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const from = process.env.EMAIL_FROM || 'Licencias Platform <noreply@licencias.com>';

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetUrl: string
): Promise<void> => {
  await transporter.sendMail({
    from,
    to,
    subject: 'Recuperación de contraseña - Licencias Platform',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 24px; margin: 0;">🔐 Licencias Platform</h1>
        </div>
        <h2 style="color: #f1f5f9;">Hola, ${name}</h2>
        <p style="color: #94a3b8; line-height: 1.6;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.
          Haz clic en el botón a continuación para crear una nueva contraseña:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo.
        </p>
      </div>
    `,
  });
};

export const sendPurchaseConfirmationEmail = async (
  to: string,
  name: string,
  licenseCode: string,
  licenseName: string,
  expiresAt: Date,
  pdfBuffer: Buffer
): Promise<void> => {
  const expiryFormatted = expiresAt.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  await transporter.sendMail({
    from,
    to,
    subject: `✅ Licencia adquirida: ${licenseName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 24px; margin: 0;">🏆 Licencias Platform</h1>
        </div>
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <p style="color: white; font-size: 14px; margin: 0 0 8px;">✅ ¡Compra exitosa!</p>
          <h2 style="color: white; margin: 0; font-size: 22px;">${licenseName}</h2>
        </div>
        <p style="color: #94a3b8; line-height: 1.6;">Hola, <strong style="color: #f1f5f9;">${name}</strong>. Tu licencia ha sido emitida exitosamente.</p>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <p style="margin: 0 0 8px; color: #94a3b8; font-size: 14px;">Código de verificación</p>
          <p style="margin: 0; color: #f1f5f9; font-size: 20px; font-family: monospace; letter-spacing: 4px; font-weight: bold;">${licenseCode}</p>
        </div>
        <table style="width: 100%; color: #94a3b8; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #1e293b;">Licencia</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #1e293b; color: #f1f5f9; text-align: right;">${licenseName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Vigencia hasta</td>
            <td style="padding: 8px 0; color: #10b981; text-align: right; font-weight: 600;">${expiryFormatted}</td>
          </tr>
        </table>
        <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
          Tu licencia en PDF está adjunta a este correo. Puedes verificarla en cualquier momento en nuestra plataforma.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `Licencia-${licenseCode}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
};

export const sendExpiryReminderEmail = async (
  to: string,
  name: string,
  licenseName: string,
  expiresAt: Date,
  daysLeft: number
): Promise<void> => {
  const expiryFormatted = expiresAt.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  await transporter.sendMail({
    from,
    to,
    subject: `⚠️ Tu licencia vence en ${daysLeft} días - ${licenseName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
        <h1 style="color: #f59e0b;">⚠️ Aviso de vencimiento</h1>
        <p>Hola <strong>${name}</strong>, tu licencia <strong>${licenseName}</strong> vence el <strong style="color: #f59e0b;">${expiryFormatted}</strong> (en ${daysLeft} días).</p>
        <p>Renueva ahora para no perder tu certificación.</p>
        <a href="${process.env.FRONTEND_URL}/licenses" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
          Ver opciones de renovación
        </a>
      </div>
    `,
  });
};
