import express from 'express';
import { body } from 'express-validator';
import { 
  startQuizAttempt, 
  submitAnswer, 
  submitQuizAttempt,
  getQuizAttempt,
  getUserQuizAttempts,
  getAllQuizAttempts
} from '../controllers/quizAttemptController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Start a quiz attempt
router.post('/:quizId/start', startQuizAttempt);

// Submit an answer
router.post(
  '/:quizAttemptId/questions/:questionId/answer',
  [
    body('selectedOptionId').optional().isInt(),
    body('textAnswer').optional()
  ],
  submitAnswer
);

// Submit the entire quiz attempt
router.post('/:quizAttemptId/submit', submitQuizAttempt);

// Get a specific quiz attempt
router.get('/:quizAttemptId', getQuizAttempt);

// Get all attempts for a quiz by the current user
router.get('/quiz/:quizId/user', getUserQuizAttempts);

// Get all attempts for a quiz (for instructors)
router.get('/quiz/:quizId/all', authorize('instructor', 'admin'), getAllQuizAttempts);

export default router;
