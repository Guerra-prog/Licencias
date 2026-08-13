import { Router } from 'express';
import * as VerifyController from '../controllers/verify.controller';

const router = Router();

// GET /api/verify/:code — verificación pública de licencia
router.get('/:code', VerifyController.verifyLicense);

export default router;
