import { NextFunction, Request, Response } from 'express';
import { uploadBuffer } from '../services/cloudinary.service';
import { prisma } from '../utils/prisma';

const ALLOWED_FOLDERS = ['logo', 'licencias', 'combos', 'comprobantes', 'perfiles'];

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo (campo "image")' });
    }

    const folder =
      typeof req.body.folder === 'string' && ALLOWED_FOLDERS.includes(req.body.folder)
        ? req.body.folder
        : 'general';

    const result = await uploadBuffer(req.file.buffer, folder);

    // Si es una foto de perfil, se asocia automáticamente al usuario autenticado
    if (folder === 'perfiles') {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { fotoPerfilUrl: result.secure_url },
      });
    }

    return res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    return next(err);
  }
}
