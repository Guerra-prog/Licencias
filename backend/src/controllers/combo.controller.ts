import { NextFunction, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

const COMBO_INCLUDE = { licenses: { include: { license: true } } } as const;

export async function listCombos(_req: Request, res: Response, next: NextFunction) {
  try {
    const combos = await prisma.combo.findMany({
      where: { activo: true },
      include: COMBO_INCLUDE,
      orderBy: { precioTotal: 'asc' },
    });
    return res.json({ combos });
  } catch (err) {
    return next(err);
  }
}

export async function getCombo(req: Request, res: Response, next: NextFunction) {
  try {
    const combo = await prisma.combo.findUnique({
      where: { id: req.params.id },
      include: COMBO_INCLUDE,
    });
    if (!combo) {
      return res.status(404).json({ error: 'Combo no encontrado' });
    }
    return res.json({ combo });
  } catch (err) {
    return next(err);
  }
}

export async function createCombo(req: Request, res: Response, next: NextFunction) {
  try {
    const { licenseIds, ...data } = req.body;
    const licenses = await prisma.license.findMany({ where: { id: { in: licenseIds } } });
    if (licenses.length !== licenseIds.length) {
      return res.status(400).json({ error: 'Una o más licencias no existen' });
    }
    const combo = await prisma.combo.create({
      data: {
        ...data,
        licenses: { create: licenseIds.map((id: string) => ({ licenseId: id })) },
      },
      include: COMBO_INCLUDE,
    });
    return res.status(201).json({ combo });
  } catch (err) {
    return next(err);
  }
}

export async function updateCombo(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.combo.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Combo no encontrado' });
    }

    const { licenseIds, ...data } = req.body;
    if (licenseIds) {
      const licenses = await prisma.license.findMany({ where: { id: { in: licenseIds } } });
      if (licenses.length !== licenseIds.length) {
        return res.status(400).json({ error: 'Una o más licencias no existen' });
      }
    }

    const combo = await prisma.combo.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(licenseIds
          ? {
              licenses: {
                deleteMany: {},
                create: licenseIds.map((id: string) => ({ licenseId: id })),
              },
            }
          : {}),
      },
      include: COMBO_INCLUDE,
    });
    return res.json({ combo });
  } catch (err) {
    return next(err);
  }
}

export async function deleteCombo(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.combo.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Combo no encontrado' });
    }
    await prisma.combo.update({ where: { id: req.params.id }, data: { activo: false } });
    return res.json({ mensaje: 'Combo desactivado correctamente' });
  } catch (err) {
    return next(err);
  }
}
