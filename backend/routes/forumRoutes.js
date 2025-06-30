import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middlewares/auth.js';  // Import the protect middleware
import {
  getAllCategories,
  getCategoryById,
  createTopic,
  getTopicById,
  createPost,
  createCategory,
  updateCategory
} from '../controllers/forumController.js';

const router = express.Router();

// Public routes
router.get('/categories', getAllCategories);
router.get('/categories/:categoryId', getCategoryById);
router.get('/topics/:topicId', getTopicById);

// Authenticated routes - First apply protect, then proceed
router.post(
  '/categories/:categoryId/topics',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required')
  ],
  protect,  // Use protect instead of empty authorize()
  createTopic
);

router.post(
  '/topics/:topicId/posts',
  [
    body('content').notEmpty().withMessage('Content is required')
  ],
  protect,  // Use protect instead of empty authorize()
  createPost
);

// Admin routes
router.post(
  '/categories',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('slug').notEmpty().withMessage('Slug is required')
  ],
  protect,  // First apply protect
  authorize('admin'),  // Then check for admin role
  createCategory
);

router.put(
  '/categories/:categoryId',
  protect,  // First apply protect
  authorize('admin'),  // Then check for admin role
  updateCategory
);

export default router;