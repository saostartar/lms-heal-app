import express from 'express';
import { 
  getCourseAnalytics, 
  getLessonAnalytics, 
  getUserAnalytics, 
  getPlatformAnalytics,
  getTopCourses,
  checkCourseAccessStatus,
  compareTestResults,
  getQuizAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Learner routes - These should be accessible to all authenticated users
router.get('/user', getUserAnalytics);
router.get('/course/:courseId/access-status', checkCourseAccessStatus); // No role restriction needed
router.get('/course/:courseId/test-comparison', compareTestResults); // No role restriction needed

// Instructor routes
router.get('/course/:courseId', authorize('instructor', 'admin'), getCourseAnalytics);
router.get('/lesson/:lessonId', authorize('instructor', 'admin'), getLessonAnalytics);
router.get('/quizzes/:quizId', authorize('instructor', 'admin'), getQuizAnalytics);

// Admin routes
router.get('/platform', authorize('admin'), getPlatformAnalytics);
router.get('/top-courses', getTopCourses);

export default router;