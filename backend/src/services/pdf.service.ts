import PDFDocument from 'pdfkit';

interface LicenseCertificateData {
  nombreEstudiante: string;
  documentoIdentidad: string | null;
  producto: string;
  codigoVerificacion: string;
  fechaEmision: Date;
}

export function generateLicenseCertificate(data: LicenseCertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fontSize(20)
      .text('Centro de Enseñanza Automovilística AMC', { align: 'center' })
      .moveDown(0.5)
      .fontSize(12)
      .text('Montería, Colombia', { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(16)
      .text('CERTIFICADO DE FORMACIÓN', { align: 'center', underline: true })
      .moveDown(2);

    doc
      .fontSize(12)
      .text(`Se certifica que ${data.nombreEstudiante}`, { align: 'center' })
      .moveDown(0.5);

    if (data.documentoIdentidad) {
      doc
        .text(`identificado(a) con documento No. ${data.documentoIdentidad}`, { align: 'center' })
        .moveDown(0.5);
    }

    doc
      .text('completó satisfactoriamente el curso de conducción:', { align: 'center' })
      .moveDown(1)
      .fontSize(14)
      .text(data.producto, { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(11)
      .text(`Fecha de emisión: ${data.fechaEmision.toLocaleDateString('es-CO')}`, {
        align: 'center',
      })
      .moveDown(0.5)
      .text(`Código de verificación: ${data.codigoVerificacion}`, { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(9)
      .fillColor('#666666')
      .text(
        'Verifique la autenticidad de este certificado con el código de verificación en la plataforma del CEA AMC.',
        { align: 'center' }
      );

    doc.end();
  });
}
