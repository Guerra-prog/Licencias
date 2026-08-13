import { Router } from 'express';
import * as GradeController from '../controllers/grade.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// GET /api/grades (público)
router.get('/', GradeController.getGrades);

// POST /api/grades (admin)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty(),
    body('order').isInt({ min: 1 }),
    body('color').optional().isHexColor(),
  ],
  validateRequest,
  GradeController.createGrade
);

// PUT /api/grades/:id (admin)
router.put('/:id', authenticate, requireAdmin, GradeController.updateGrade);

// DELETE /api/grades/:id (admin)
router.delete('/:id', authenticate, requireAdmin, GradeController.deleteGrade);

export default router;
