import { NextFunction, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function listServices(_req: Request, res: Response, next: NextFunction) {
  try {
    const services = await prisma.additionalService.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
    return res.json({ services });
  } catch (err) {
    return next(err);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await prisma.additionalService.create({ data: req.body });
    return res.status(201).json({ service });
  } catch (err) {
    return next(err);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.additionalService.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    const service = await prisma.additionalService.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ service });
  } catch (err) {
    return next(err);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.additionalService.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    await prisma.additionalService.update({
      where: { id: req.params.id },
      data: { activo: false },
    });
    return res.json({ mensaje: 'Servicio desactivado correctamente' });
  } catch (err) {
    return next(err);
  }
}
