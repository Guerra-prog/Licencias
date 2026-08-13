import { Router } from 'express';
import { body } from 'express-validator';
import * as UserController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/users/me
router.get('/me', UserController.getMe);

// PUT /api/users/me
router.put(
  '/me',
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('phone').optional().isMobilePhone('any').withMessage('Teléfono inválido'),
    body('currentPassword').optional().isLength({ min: 6 }),
    body('newPassword').optional().isLength({ min: 6 }),
  ],
  validateRequest,
  UserController.updateMe
);

// GET /api/users/me/licenses
router.get('/me/licenses', UserController.getMyLicenses);

// GET /api/users/me/orders
router.get('/me/orders', UserController.getMyOrders);

export default router;
