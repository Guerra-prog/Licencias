import { Router } from 'express';
import { body, query } from 'express-validator';
import * as LicenseController from '../controllers/license.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// GET /api/licenses (público)
router.get(
  '/',
  [
    query('gradeId').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('search').optional().isString(),
  ],
  validateRequest,
  LicenseController.getLicenses
);

// GET /api/licenses/:id (público)
router.get('/:id', LicenseController.getLicenseById);

// POST /api/licenses (solo admin)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Nombre requerido'),
    body('description').trim().notEmpty().withMessage('Descripción requerida'),
    body('price').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('durationDays').isInt({ min: 1 }).withMessage('Duración inválida'),
    body('gradeId').notEmpty().withMessage('Grado requerido'),
    body('benefits').isArray({ min: 1 }).withMessage('Beneficios requeridos'),
  ],
  validateRequest,
  LicenseController.createLicense
);

// PUT /api/licenses/:id (solo admin)
router.put('/:id', authenticate, requireAdmin, LicenseController.updateLicense);

// DELETE /api/licenses/:id (solo admin)
router.delete('/:id', authenticate, requireAdmin, LicenseController.deleteLicense);

export default router;
