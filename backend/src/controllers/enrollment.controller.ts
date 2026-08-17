import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { generateLicenseCertificate } from '../services/pdf.service';
import { uploadBuffer } from '../services/cloudinary.service';

const ENROLLMENT_INCLUDE = {
  license: true,
  combo: { include: { licenses: { include: { license: true } } } },
  payments: true,
} as const;

const EDAD_MINIMA_A2 = 16;
const EDAD_MINIMA_GENERAL = 18;

function validateRequirements(
  codigos: string[],
  edad: number,
  tieneLicenciaB1: boolean,
  tieneLicenciaC1: boolean
): string | null {
  const soloA2 = codigos.length === 1 && codigos[0] === 'A2';
  const edadMinima = soloA2 ? EDAD_MINIMA_A2 : EDAD_MINIMA_GENERAL;
  if (edad < edadMinima) {
    return `Debes tener al menos ${edadMinima} años para inscribirte en este curso`;
  }
  if (codigos.includes('RC1') && !tieneLicenciaB1) {
    return 'La recategorización RC1 requiere tener licencia B1 registrada en el RUNT';
  }
  if (codigos.includes('RC2') && !tieneLicenciaC1) {
    return 'La recategorización RC2 requiere tener licencia C1 registrada en el RUNT';
  }
  return null;
}

export async function createEnrollment(req: Request, res: Response, next: NextFunction) {
  try {
    const { licenseId, comboId, edad, tieneLicenciaB1, tieneLicenciaC1 } = req.body;

    let codigos: string[] = [];
    if (licenseId) {
      const license = await prisma.license.findUnique({ where: { id: licenseId } });
      if (!license || !license.activo) {
        return res.status(404).json({ error: 'Licencia no encontrada o inactiva' });
      }
      codigos = [license.codigo];
    } else {
      const combo = await prisma.combo.findUnique({
        where: { id: comboId },
        include: { licenses: { include: { license: true } } },
      });
      if (!combo || !combo.activo) {
        return res.status(404).json({ error: 'Combo no encontrado o inactivo' });
      }
      codigos = combo.licenses.map((cl) => cl.license.codigo);
    }

    const requirementError = validateRequirements(codigos, edad, tieneLicenciaB1, tieneLicenciaC1);
    if (requirementError) {
      return res.status(422).json({ error: requirementError });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user!.userId,
        licenseId: licenseId || null,
        comboId: comboId || null,
        codigoVerificacion: uuidv4(),
      },
      include: ENROLLMENT_INCLUDE,
    });

    return res.status(201).json({ enrollment });
  } catch (err) {
    return next(err);
  }
}

export async function myEnrollments(req: Request, res: Response, next: NextFunction) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.userId },
      include: ENROLLMENT_INCLUDE,
      orderBy: { fechaInscripcion: 'desc' },
    });
    return res.json({ enrollments });
  } catch (err) {
    return next(err);
  }
}

export async function listEnrollments(req: Request, res: Response, next: NextFunction) {
  try {
    const { estado } = req.query;
    const validStates = ['pendiente', 'pagado', 'en_curso', 'finalizado'];
    const where =
      typeof estado === 'string' && validStates.includes(estado)
        ? { estado: estado as 'pendiente' | 'pagado' | 'en_curso' | 'finalizado' }
        : {};

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        ...ENROLLMENT_INCLUDE,
        user: { select: { id: true, nombre: true, email: true, documentoIdentidad: true } },
      },
      orderBy: { fechaInscripcion: 'desc' },
    });
    return res.json({ enrollments });
  } catch (err) {
    return next(err);
  }
}

export async function updateEnrollment(req: Request, res: Response, next: NextFunction) {
  try {
    const { estado, emitirLicencia } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: req.params.id },
      include: { user: true, license: true, combo: true },
    });
    if (!enrollment) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    let licenciaEmitidaUrl = enrollment.licenciaEmitidaUrl;
    if (emitirLicencia) {
      const producto = enrollment.license?.nombre || enrollment.combo?.nombre || 'Curso CEA AMC';
      const pdfBuffer = await generateLicenseCertificate({
        nombreEstudiante: enrollment.user.nombre,
        documentoIdentidad: enrollment.user.documentoIdentidad,
        producto,
        codigoVerificacion: enrollment.codigoVerificacion,
        fechaEmision: new Date(),
      });
      const uploaded = await uploadBuffer(pdfBuffer, 'licencias-emitidas', 'raw');
      licenciaEmitidaUrl = uploaded.secure_url;
    }

    const updated = await prisma.enrollment.update({
      where: { id: req.params.id },
      data: {
        ...(estado ? { estado } : {}),
        ...(emitirLicencia ? { licenciaEmitidaUrl, estado: estado || 'finalizado' } : {}),
      },
      include: ENROLLMENT_INCLUDE,
    });

    return res.json({ enrollment: updated });
  } catch (err) {
    return next(err);
  }
}

export async function verifyEnrollment(req: Request, res: Response, next: NextFunction) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { codigoVerificacion: req.params.codigoVerificacion },
      include: {
        user: { select: { nombre: true } },
        license: { select: { codigo: true, nombre: true } },
        combo: { select: { nombre: true } },
      },
    });

    if (!enrollment || !enrollment.licenciaEmitidaUrl) {
      return res.status(404).json({ valido: false, error: 'Certificado no encontrado o no emitido' });
    }

    return res.json({
      valido: true,
      certificado: {
        estudiante: enrollment.user.nombre,
        producto: enrollment.license?.nombre || enrollment.combo?.nombre,
        estado: enrollment.estado,
        fechaInscripcion: enrollment.fechaInscripcion,
        codigoVerificacion: enrollment.codigoVerificacion,
      },
    });
  } catch (err) {
    return next(err);
  }
}
