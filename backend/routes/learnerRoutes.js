import express from 'express';
import { 
  getLearnerStats, 
  getRecentCourses,
  updateLearnerProfile,
  getLearnerEnrollments,
  getLearnerEnrollment
} from '../controllers/learnerController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get learner statistics for dashboard
router.get('/stats', getLearnerStats);

// Get recently accessed courses
router.get('/recent-courses', getRecentCourses);

// Update learner profile
router.put('/profile', updateLearnerProfile);

// Get all learner enrollments
router.get('/enrollments', getLearnerEnrollments);

// Get specific course enrollment
router.get('/enrollments/course/:courseId', getLearnerEnrollment);

export default router;