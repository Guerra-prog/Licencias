import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';

const ADMIN_USER_SELECT = {
  id: true,
  nombre: true,
  email: true,
  telefono: true,
  documentoIdentidad: true,
  role: true,
  activo: true,
  fechaRegistro: true,
  fotoPerfilUrl: true,
} as const;

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: ADMIN_USER_SELECT,
      orderBy: { fechaRegistro: 'desc' },
    });
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: ADMIN_USER_SELECT,
    });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function createAdminUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { nombre, email, password, telefono, documentoIdentidad } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con este email' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nombre, email, password: hashed, telefono, documentoIdentidad, role: 'admin' },
      select: ADMIN_USER_SELECT,
    });
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
}
