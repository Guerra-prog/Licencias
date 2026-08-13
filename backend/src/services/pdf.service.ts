import PDFDocument from 'pdfkit';

interface LicenseData {
  userName: string;
  userEmail: string;
  licenseName: string;
  gradeLevel: string;
  gradeColor: string;
  code: string;
  issuedAt: Date;
  expiresAt: Date;
}

export const generateLicensePDF = (data: LicenseData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const W = doc.page.width;
    const H = doc.page.height;

    // Background gradient effect
    doc.rect(0, 0, W, H).fill('#0f172a');

    // Decorative border
    doc.rect(20, 20, W - 40, H - 40).lineWidth(3).stroke('#6366f1');
    doc.rect(28, 28, W - 56, H - 56).lineWidth(1).stroke('#8b5cf6').opacity(0.4);
    doc.opacity(1);

    // Corner decorations
    const cornerSize = 30;
    [[25, 25], [W - 55, 25], [25, H - 55], [W - 55, H - 55]].forEach(([x, y]) => {
      doc.rect(x, y, cornerSize, cornerSize).lineWidth(2).stroke('#6366f1');
    });

    // Header band
    doc.rect(20, 20, W - 40, 80).fill('#1e1b4b');

    // Title
    doc
      .fillColor('#a5b4fc')
      .fontSize(13)
      .font('Helvetica')
      .text('PLATAFORMA DE CERTIFICACIONES PROFESIONALES', 0, 40, {
        align: 'center',
        width: W,
      });

    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('CERTIFICADO DE LICENCIA PROFESIONAL', 0, 58, {
        align: 'center',
        width: W,
      });

    // Grade badge
    const badgeY = 115;
    doc
      .roundedRect(W / 2 - 90, badgeY, 180, 30, 15)
      .fill(data.gradeColor || '#6366f1');
    doc
      .fillColor('#ffffff')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`NIVEL ${data.gradeLevel.toUpperCase()}`, 0, badgeY + 8, {
        align: 'center',
        width: W,
      });

    // Main certificate content
    doc
      .fillColor('#94a3b8')
      .fontSize(13)
      .font('Helvetica')
      .text('Se certifica que', 0, 170, { align: 'center', width: W });

    doc
      .fillColor('#f1f5f9')
      .fontSize(30)
      .font('Helvetica-Bold')
      .text(data.userName, 0, 192, { align: 'center', width: W });

    doc
      .fillColor('#94a3b8')
      .fontSize(13)
      .font('Helvetica')
      .text('ha obtenido satisfactoriamente la licencia', 0, 238, { align: 'center', width: W });

    doc
      .fillColor('#a5b4fc')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(data.licenseName, 60, 262, { align: 'center', width: W - 120 });

    // Divider line
    doc
      .moveTo(100, 310)
      .lineTo(W - 100, 310)
      .lineWidth(1)
      .stroke('#334155');

    // Dates
    const issuedStr = data.issuedAt.toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const expiresStr = data.expiresAt.toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    doc
      .fillColor('#64748b').fontSize(11).font('Helvetica')
      .text('Fecha de emisión', 100, 325)
      .fillColor('#f1f5f9').fontSize(12).font('Helvetica-Bold')
      .text(issuedStr, 100, 340)
      .fillColor('#64748b').fontSize(11).font('Helvetica')
      .text('Válido hasta', W - 250, 325)
      .fillColor('#10b981').fontSize(12).font('Helvetica-Bold')
      .text(expiresStr, W - 250, 340);

    // Verification code box
    const codeBoxY = 380;
    doc.rect(W / 2 - 200, codeBoxY, 400, 60).fill('#1e293b');
    doc.rect(W / 2 - 200, codeBoxY, 400, 60).lineWidth(1).stroke('#334155');

    doc
      .fillColor('#6366f1').fontSize(10).font('Helvetica')
      .text('CÓDIGO DE VERIFICACIÓN', 0, codeBoxY + 10, { align: 'center', width: W });
    doc
      .fillColor('#f1f5f9').fontSize(20).font('Helvetica-Bold')
      .text(data.code, 0, codeBoxY + 26, { align: 'center', width: W, characterSpacing: 6 });

    // Footer
    doc
      .fillColor('#475569').fontSize(9).font('Helvetica')
      .text(
        `Este documento es una certificación oficial emitida por Licencias Platform. Verifique su autenticidad en: ${process.env.APP_URL || 'https://licencias.com'}/verify/${data.code}`,
        60,
        H - 50,
        { align: 'center', width: W - 120 }
      );

    doc.end();
  });
};
