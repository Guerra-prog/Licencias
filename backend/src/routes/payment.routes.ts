import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import { checkoutSchema } from '../validators/enrollment.validators';

const router = Router();

router.post('/checkout', requireAuth, validateBody(checkoutSchema), paymentController.checkout);

export default router;
