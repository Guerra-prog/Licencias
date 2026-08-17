import { z } from 'zod';

export const createEnrollmentSchema = z
  .object({
    licenseId: z.string().uuid().optional(),
    comboId: z.string().uuid().optional(),
    edad: z.number().int().min(1).max(120),
    tieneLicenciaB1: z.boolean().optional().default(false),
    tieneLicenciaC1: z.boolean().optional().default(false),
  })
  .refine((data) => Boolean(data.licenseId) !== Boolean(data.comboId), {
    message: 'Debe indicar licenseId o comboId (exactamente uno de los dos)',
  });

export const updateEnrollmentSchema = z.object({
  estado: z.enum(['pendiente', 'pagado', 'en_curso', 'finalizado']).optional(),
  emitirLicencia: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(['admin', 'student']).optional(),
  activo: z.boolean().optional(),
});

export const createAdminUserSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  telefono: z.string().trim().min(7).max(20).optional(),
  documentoIdentidad: z.string().trim().min(5).max(20).optional(),
});

export const checkoutSchema = z.object({
  enrollmentId: z.string().uuid(),
});
