import { Router } from 'express';
import * as PaymentController from '../controllers/payment.controller';

const router = Router();

// POST /api/payments/webhook — webhook de Stripe (raw body)
router.post('/webhook', PaymentController.stripeWebhook);

export default router;
