import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';

// GET /api/users/me
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { userLicenses: true, purchases: true },
        },
      },
    });

    if (!user) throw createError('Usuario no encontrado', 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    // Cambio de contraseña
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) throw createError('Usuario no encontrado', 404);

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw createError('Contraseña actual incorrecta', 400);

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    res.json({ message: 'Perfil actualizado', user: updated });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/licenses
export const getMyLicenses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const licenses = await prisma.userLicense.findMany({
      where: { userId: req.user!.id },
      include: {
        license: {
          include: { grade: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    const now = new Date();
    const result = licenses.map((ul) => ({
      ...ul,
      status: ul.expiresAt > now ? 'ACTIVE' : 'EXPIRED',
      daysUntilExpiry: Math.ceil(
        (ul.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/orders
export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.purchase.findMany({
      where: { userId: req.user!.id },
      include: {
        license: { include: { grade: true } },
        userLicense: { select: { code: true, expiresAt: true, pdfUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};
