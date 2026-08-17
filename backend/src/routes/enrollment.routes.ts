import { Router } from 'express';
import * as enrollmentController from '../controllers/enrollment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import { createEnrollmentSchema } from '../validators/enrollment.validators';

const router = Router();

router.post('/', requireAuth, validateBody(createEnrollmentSchema), enrollmentController.createEnrollment);
router.get('/me', requireAuth, enrollmentController.myEnrollments);

export default router;
