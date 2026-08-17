import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth.middleware';
import { loginRateLimiter } from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validators';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', loginRateLimiter, validateBody(loginSchema), authController.login);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);
router.get('/me', requireAuth, authController.me);

export default router;
