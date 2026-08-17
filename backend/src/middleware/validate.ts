import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos inválidos',
          detalles: err.errors.map((e) => ({
            campo: e.path.join('.'),
            mensaje: e.message,
          })),
        });
      }
      return next(err);
    }
  };
}
