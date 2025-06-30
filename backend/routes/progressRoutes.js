import express from 'express';
import { body } from 'express-validator';
import { 
  updateLessonProgress, 
  getLessonProgress, 
  getModuleProgress, 
  getCourseProgress 
} from '../controllers/progressController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Semua routes memerlukan autentikasi
router.use(protect);

// Lesson progress routes
router.put(
  '/lesson/:lessonId',
  [
    body('status').optional().isIn(['not_started', 'in_progress', 'completed']),
    body('timeSpent').optional().isInt({ min: 0 })
  ],
  updateLessonProgress
);

router.get('/lesson/:lessonId', getLessonProgress);

// Module progress routes
router.get('/module/:moduleId', getModuleProgress);

// Course progress routes
router.get('/course/:courseId', getCourseProgress);

export default router;
