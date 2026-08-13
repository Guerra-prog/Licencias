import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

// GET /api/licenses
export const getLicenses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId, minPrice, maxPrice, search, active } = req.query;

    const where: Record<string, unknown> = {};

    if (active !== 'false') where.active = true; // Por defecto solo activas
    if (gradeId) where.gradeId = String(gradeId);
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(String(minPrice));
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(String(maxPrice));
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const licenses = await prisma.license.findMany({
      where,
      include: { grade: true, prerequisite: { select: { id: true, name: true } } },
      orderBy: [{ grade: { order: 'asc' } }, { price: 'asc' }],
    });

    res.json(licenses);
  } catch (err) {
    next(err);
  }
};

// GET /api/licenses/:id
export const getLicenseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const license = await prisma.license.findUnique({
      where: { id: req.params.id },
      include: {
        grade: true,
        prerequisite: { include: { grade: true } },
        dependents: { select: { id: true, name: true } },
      },
    });

    if (!license) throw createError('Licencia no encontrada', 404);
    res.json(license);
  } catch (err) {
    next(err);
  }
};

// POST /api/licenses
export const createLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name, description, price, durationDays, gradeId,
      benefits, requirements, syllabus, prerequisiteId, imageUrl,
    } = req.body;

    const license = await prisma.license.create({
      data: {
        name, description, price, durationDays, gradeId,
        benefits, requirements, syllabus, prerequisiteId, imageUrl,
      },
      include: { grade: true },
    });

    res.status(201).json({ message: 'Licencia creada', license });
  } catch (err) {
    next(err);
  }
};

// PUT /api/licenses/:id
export const updateLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Remove undefined/null keys
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    const license = await prisma.license.update({
      where: { id },
      data,
      include: { grade: true },
    });

    res.json({ message: 'Licencia actualizada', license });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/licenses/:id
export const deleteLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Soft delete — desactivar en lugar de eliminar
    await prisma.license.update({
      where: { id },
      data: { active: false },
    });

    res.json({ message: 'Licencia desactivada' });
  } catch (err) {
    next(err);
  }
};
