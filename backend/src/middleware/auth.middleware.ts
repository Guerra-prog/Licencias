import { NextFunction, Request, Response } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Usuario no válido o inactivo' });
    }
    req.user = { userId: user.id, role: user.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  return next();
}
