import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const getGrades = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const grades = await prisma.specializationGrade.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { licenses: true } } },
    });
    res.json(grades);
  } catch (err) {
    next(err);
  }
};

export const createGrade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, order, color } = req.body;
    const grade = await prisma.specializationGrade.create({
      data: { name, description, order, color },
    });
    res.status(201).json({ message: 'Grado creado', grade });
  } catch (err) {
    next(err);
  }
};

export const updateGrade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const grade = await prisma.specializationGrade.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ message: 'Grado actualizado', grade });
  } catch (err) {
    next(err);
  }
};

export const deleteGrade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hasLicenses = await prisma.license.count({ where: { gradeId: req.params.id } });
    if (hasLicenses > 0) {
      throw createError('No se puede eliminar un grado con licencias asociadas', 400);
    }
    await prisma.specializationGrade.delete({ where: { id: req.params.id } });
    res.json({ message: 'Grado eliminado' });
  } catch (err) {
    next(err);
  }
};
