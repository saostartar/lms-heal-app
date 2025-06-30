import express from 'express';
import { body } from 'express-validator';
import { 
  getCourseModules, 
  getModule, 
  createModule, 
  updateModule, 
  deleteModule ,
  getModulesByCourse
} from '../controllers/modulesController.js';
import { protect, authorize, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Course modules routes
router.get('/course/:courseId', optionalAuth, getCourseModules);

// Create a module for a course
router.post(
  '/course/:courseId',
  [
    body('title', 'Title is required').not().isEmpty(),
    body('description').optional(),
    body('position').optional().isInt({ min: 0 })
  ],
  authorize('instructor', 'admin'),
  createModule
);

router.get('/course/:courseId', getModulesByCourse);

// Get, update, and delete a specific module
router.get('/:moduleId', getModule);

router.put(
  '/:moduleId',
  [
    body('title').optional().not().isEmpty(),
    body('description').optional(),
    body('position').optional().isInt({ min: 0 })
  ],
  authorize('instructor', 'admin'),
  updateModule
);

router.delete('/:moduleId', authorize('instructor', 'admin'), deleteModule);

export default router;