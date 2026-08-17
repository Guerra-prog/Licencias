import { Router } from 'express';
import * as licenseController from '../controllers/license.controller';
import * as comboController from '../controllers/combo.controller';
import * as serviceController from '../controllers/service.controller';
import * as enrollmentController from '../controllers/enrollment.controller';
import * as userController from '../controllers/user.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import {
  licenseSchema,
  licenseUpdateSchema,
  comboSchema,
  comboUpdateSchema,
  serviceSchema,
  serviceUpdateSchema,
} from '../validators/catalog.validators';
import {
  updateEnrollmentSchema,
  updateUserSchema,
  createAdminUserSchema,
} from '../validators/enrollment.validators';

const router = Router();

router.use(requireAuth, requireAdmin);

// Licencias
router.post('/licenses', validateBody(licenseSchema), licenseController.createLicense);
router.put('/licenses/:id', validateBody(licenseUpdateSchema), licenseController.updateLicense);
router.delete('/licenses/:id', licenseController.deleteLicense);

// Combos
router.post('/combos', validateBody(comboSchema), comboController.createCombo);
router.put('/combos/:id', validateBody(comboUpdateSchema), comboController.updateCombo);
router.delete('/combos/:id', comboController.deleteCombo);

// Servicios adicionales
router.post('/services', validateBody(serviceSchema), serviceController.createService);
router.put('/services/:id', validateBody(serviceUpdateSchema), serviceController.updateService);
router.delete('/services/:id', serviceController.deleteService);

// Inscripciones
router.get('/enrollments', enrollmentController.listEnrollments);
router.put(
  '/enrollments/:id',
  validateBody(updateEnrollmentSchema),
  enrollmentController.updateEnrollment
);

// Usuarios
router.get('/users', userController.listUsers);
router.post('/users', validateBody(createAdminUserSchema), userController.createAdminUser);
router.put('/users/:id', validateBody(updateUserSchema), userController.updateUser);

export default router;
