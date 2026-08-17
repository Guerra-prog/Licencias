import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { env } from '../config/env';

const PUBLIC_USER_SELECT = {
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

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { nombre, email, password, telefono, documentoIdentidad } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con este email' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nombre, email, password: hashed, telefono, documentoIdentidad, role: 'student' },
      select: PUBLIC_USER_SELECT,
    });

    const token = signToken({ userId: user.id, role: user.role });
    return res.status(201).json({ token, user });
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    if (!user.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada. Contacta al administrador.' });
    }

    const token = signToken({ userId: user.id, role: user.role });
    const { password: _pw, resetToken: _rt, resetTokenExpires: _rte, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    return next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Siempre responde 200 para no revelar si el email existe
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      if (env.nodeEnv === 'development') {
        console.log(`[DEV] Token de recuperación para ${email}: ${token}`);
        return res.json({
          mensaje: 'Si el email existe, se enviará un enlace de recuperación.',
          resetToken: token,
        });
      }
    }

    return res.json({ mensaje: 'Si el email existe, se enviará un enlace de recuperación.' });
  } catch (err) {
    return next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
    });
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpires: null },
    });

    return res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    return next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}
