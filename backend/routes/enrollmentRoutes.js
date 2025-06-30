import express from 'express';
import { body } from 'express-validator';
import { 
  enrollCourse, 
  getEnrolledCourses, 
  getEnrollmentStatus, 
  unenrollCourse,
  getCourseEnrollments 
} from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Semua routes memerlukan autentikasi
router.use(protect);

router.post(
  '/',
  [
    body('courseId', 'Course ID is required').not().isEmpty().isInt()
  ],
  enrollCourse
);

router.get('/', getEnrolledCourses);
router.get('/:courseId', getEnrollmentStatus);
router.delete('/:courseId', unenrollCourse);
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), getCourseEnrollments);

export default router;
