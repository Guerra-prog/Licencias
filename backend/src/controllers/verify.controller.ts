import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

// GET /api/verify/:code
export const verifyLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;

    const userLicense = await prisma.userLicense.findUnique({
      where: { code },
      include: {
        user: { select: { name: true, email: true } },
        license: { include: { grade: true } },
      },
    });

    if (!userLicense) {
      throw createError('Código de licencia no encontrado', 404);
    }

    const now = new Date();
    const isActive = userLicense.expiresAt > now;
    const daysUntilExpiry = Math.ceil(
      (userLicense.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      valid: true,
      status: isActive ? 'ACTIVA' : 'VENCIDA',
      isActive,
      code: userLicense.code,
      holder: userLicense.user.name,
      license: {
        name: userLicense.license.name,
        grade: userLicense.license.grade.name,
        gradeColor: userLicense.license.grade.color,
      },
      issuedAt: userLicense.issuedAt,
      expiresAt: userLicense.expiresAt,
      daysUntilExpiry,
    });
  } catch (err) {
    next(err);
  }
};
