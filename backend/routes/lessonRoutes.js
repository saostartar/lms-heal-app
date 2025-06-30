import express from 'express';
import { body } from 'express-validator';
import {
  getModuleLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lessonController.js';
import { protect, authorize } from '../middlewares/auth.js';
import uploadLessonAttachments from '../utils/lessonUploadConfig.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all lessons for a module
router.get('/module/:moduleId', getModuleLessons);

// Get a specific lesson
router.get('/:lessonId', getLesson);

// Create a lesson for a module (only instructors and admins)
router.post(
  '/module/:moduleId',
  uploadLessonAttachments,
  authorize('instructor', 'admin'),
  [
    body('title', 'Title is required').not().isEmpty(),
    body('content', 'Content is required').not().isEmpty(),
    body('type').optional().isIn(['video', 'text', 'quiz']),
    body('videoUrl').optional().custom((value, { req }) => {
      // Only validate videoUrl as a URL if the type is video
      if (req.body.type === 'video') {
        if (!value) {
          throw new Error('Video URL is required for video lessons');
        }
        // Check if it's a valid URL
        const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        if (!urlPattern.test(value)) {
          throw new Error('Please enter a valid URL');
        }
      }
      return true;
    }),
    body('duration').optional().isInt({ min: 1 }),
    body('position').optional().isInt({ min: 0 }),
  ],

  createLesson
);

// Update a lesson (only instructors and admins)
router.put(
  '/:lessonId',
  authorize('instructor', 'admin'),
  uploadLessonAttachments,
  [
    body('title').optional().not().isEmpty(),
    body('content').optional().not().isEmpty(),
    body('type').optional().isIn(['video', 'text', 'quiz']),
    body('videoUrl').optional().custom((value, { req }) => {
      // Only validate videoUrl as a URL if the type is video
      if (req.body.type === 'video') {
        if (!value) {
          throw new Error('Video URL is required for video lessons');
        }
        // Check if it's a valid URL
        const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        if (!urlPattern.test(value)) {
          throw new Error('Please enter a valid URL');
        }
      }
      return true;
    }),
    body('duration').optional().isInt({ min: 1 }),
    body('position').optional().isInt({ min: 0 }),
  ],
 
  updateLesson
);

// Delete a lesson (only instructors and admins)
router.delete('/:lessonId', authorize('instructor', 'admin'), deleteLesson);

router.get('/download/uploads/lessons/:filename', protect, async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Security check - validate the filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: "Invalid filename",
      });
    }
    
    const filePath = path.join(process.cwd(), 'uploads', 'lessons', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
    
    // Send the file
    res.download(filePath);
  } catch (error) {
    next(error);
  }
});

export default router;