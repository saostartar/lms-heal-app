import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getAllCourses, 
  getCourse, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getInstructorCourses,
  getFeaturedCourses,
  getCourseTests,
  updateCourseTests,
  createCourseTests,
  updateCoursePrePostTests,
  getCourseTestsWithQuestions,
  deleteCourseTests,
  getAllPathsForStaticGeneration
} from '../controllers/courseController.js';
import { getAllQuizzes } from '../controllers/quizController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// --- Multer Configuration for Thumbnails ---
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/thumbnails';
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: course-userId-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `course-${req.user?.id || 'temp'}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const thumbnailFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadThumbnail = multer({ 
  storage: thumbnailStorage, 
  fileFilter: thumbnailFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB size limit
  }
});
// --- End Multer Configuration ---

// IMPORTANT: Endpoint khusus untuk static generation harus di atas rute dinamis
router.get('/all-paths-for-static-gen', getAllPathsForStaticGeneration);

// Public routes
router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);

// Protected routes
router.use(protect);

// Instructor routes
router.get('/instructor/courses', getInstructorCourses);
router.get("/quizzes", protect, authorize("instructor", "admin"), getAllQuizzes);

// Create course - instructor only
router.post(
  '/',
  authorize('instructor'),
  uploadThumbnail.single('thumbnailImage'), // Handle thumbnail upload
  [
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('category').optional().isIn(['psikologi', 'mental', 'gizi']), // Updated to match model enum
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced'])
  ],
  createCourse
);

// Course-specific routes (dengan parameter :id)
router.get('/:id', getCourse);
router.get('/:id/tests', getCourseTests);

// Update course
router.put(
  '/:id',
  authorize('instructor'),
  uploadThumbnail.single('thumbnailImage'), // Handle thumbnail upload
  [
    body('title').optional().not().isEmpty(),
    body('description').optional().not().isEmpty(),
    body('category').optional().isIn(['psikologi', 'mental', 'gizi']), // Updated to match model enum
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced'])
  ],
  updateCourse
);

router.put('/:id/tests', authorize('instructor'), updateCourseTests);

// Delete course
router.delete('/:id', authorize('instructor'), deleteCourse);

router.post("/:courseId/tests", authorize("instructor", "admin"), createCourseTests);
router.put("/:courseId/tests", authorize("instructor", "admin"), updateCoursePrePostTests);
router.get("/:courseId/tests/with-questions", getCourseTestsWithQuestions);
router.delete("/:courseId/tests", authorize("instructor", "admin"), deleteCourseTests);

export default router;