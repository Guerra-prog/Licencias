import { z } from 'zod';

export const licenseSchema = z.object({
  codigo: z.string().trim().min(1).max(10),
  nombre: z.string().trim().min(2).max(150),
  descripcion: z.string().trim().min(1),
  precioCurso: z.number().int().nonnegative(),
  precioMedico: z.number().int().nonnegative(),
  precioLicenciaTransito: z.number().int().nonnegative(),
  precioTotal: z.number().int().nonnegative(),
  horasTeoria: z.number().int().nonnegative(),
  horasTaller: z.number().int().nonnegative(),
  horasPractica: z.number().int().nonnegative(),
  horasTotal: z.number().int().nonnegative(),
  imagenUrl: z.string().url().optional().nullable(),
  requisitos: z.string().trim().optional().nullable(),
  activo: z.boolean().optional(),
});

export const licenseUpdateSchema = licenseSchema.partial();

export const comboSchema = z.object({
  nombre: z.string().trim().min(2).max(150),
  descripcion: z.string().trim().min(1),
  licenseIds: z.array(z.string().uuid()).min(1),
  precioCurso: z.number().int().nonnegative(),
  precioMedico: z.number().int().nonnegative(),
  precioTransito: z.number().int().nonnegative(),
  precioTotal: z.number().int().nonnegative(),
  imagenUrl: z.string().url().optional().nullable(),
  activo: z.boolean().optional(),
});

export const comboUpdateSchema = comboSchema.partial();

export const serviceSchema = z.object({
  nombre: z.string().trim().min(2).max(150),
  descripcion: z.string().trim().min(1),
  activo: z.boolean().optional(),
});

export const serviceUpdateSchema = serviceSchema.partial();
