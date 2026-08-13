import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Datos inválidos',
      details: errors.array().map((e) => ({
        field: e.type === 'field' ? e.path : 'general',
        message: e.msg,
      })),
    });
    return;
  }
  next();
};
