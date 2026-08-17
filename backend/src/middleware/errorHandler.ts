import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({
    error: 'Error interno del servidor',
    ...(env.nodeEnv === 'development' ? { detalle: err.message } : {}),
  });
}
