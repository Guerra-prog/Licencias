import { Router } from 'express';
import * as licenseController from '../controllers/license.controller';
import * as comboController from '../controllers/combo.controller';
import * as serviceController from '../controllers/service.controller';

const router = Router();

// Rutas públicas de lectura
router.get('/licenses', licenseController.listLicenses);
router.get('/licenses/:id', licenseController.getLicense);
router.get('/combos', comboController.listCombos);
router.get('/combos/:id', comboController.getCombo);
router.get('/services', serviceController.listServices);

export default router;
