import { NextFunction, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function listLicenses(_req: Request, res: Response, next: NextFunction) {
  try {
    const licenses = await prisma.license.findMany({
      where: { activo: true },
      orderBy: { precioTotal: 'asc' },
    });
    return res.json({ licenses });
  } catch (err) {
    return next(err);
  }
}

export async function getLicense(req: Request, res: Response, next: NextFunction) {
  try {
    const license = await prisma.license.findUnique({ where: { id: req.params.id } });
    if (!license) {
      return res.status(404).json({ error: 'Licencia no encontrada' });
    }
    return res.json({ license });
  } catch (err) {
    return next(err);
  }
}

export async function createLicense(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.license.findUnique({ where: { codigo: req.body.codigo } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una licencia con ese código' });
    }
    const license = await prisma.license.create({ data: req.body });
    return res.status(201).json({ license });
  } catch (err) {
    return next(err);
  }
}

export async function updateLicense(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.license.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Licencia no encontrada' });
    }
    const license = await prisma.license.update({ where: { id: req.params.id }, data: req.body });
    return res.json({ license });
  } catch (err) {
    return next(err);
  }
}

export async function deleteLicense(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.license.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Licencia no encontrada' });
    }
    // Borrado lógico para no romper inscripciones históricas
    await prisma.license.update({ where: { id: req.params.id }, data: { activo: false } });
    return res.json({ mensaje: 'Licencia desactivada correctamente' });
  } catch (err) {
    return next(err);
  }
}
