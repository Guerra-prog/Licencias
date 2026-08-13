import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas admin requieren autenticación + rol ADMIN
router.use(authenticate, requireAdmin);

// GET /api/admin/users
router.get('/users', AdminController.getUsers);

// PUT /api/admin/users/:id
router.put('/users/:id', AdminController.updateUser);

// GET /api/admin/reports
router.get('/reports', AdminController.getSalesReport);

// GET /api/admin/conversations
router.get('/conversations', AdminController.getConversations);

// GET /api/admin/conversations/:id
router.get('/conversations/:id', AdminController.getConversationMessages);

// POST /api/admin/conversations/:id/reply — responder un mensaje de WhatsApp
router.post('/conversations/:id/reply', AdminController.replyToConversation);

// GET /api/admin/licenses — todas (incluyendo inactivas)
router.get('/licenses', AdminController.getAllLicenses);

// GET /api/admin/expiring-soon — licencias próximas a vencer
router.get('/expiring-soon', AdminController.getExpiringSoon);

export default router;
