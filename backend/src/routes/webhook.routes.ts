import { Router } from 'express';
import * as WhatsAppController from '../controllers/whatsapp.controller';

const router = Router();

// POST /api/webhook/whatsapp — incoming messages from Twilio
router.post('/whatsapp', WhatsAppController.receiveMessage);

export default router;
