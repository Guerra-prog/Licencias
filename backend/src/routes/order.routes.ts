import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// POST /api/orders/checkout — crear checkout session de Stripe
router.post(
  '/checkout',
  authenticate,
  [body('licenseId').notEmpty().withMessage('licenseId requerido')],
  validateRequest,
  OrderController.createCheckout
);

// GET /api/orders/me — órdenes del usuario autenticado
router.get('/me', authenticate, OrderController.getMyOrders);

export default router;
