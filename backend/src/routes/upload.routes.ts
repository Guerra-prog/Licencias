import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadImage } from '../middleware/upload';

const router = Router();

router.post('/image', requireAuth, uploadImage.single('image'), uploadController.uploadImage);

export default router;
