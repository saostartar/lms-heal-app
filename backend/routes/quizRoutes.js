import express from 'express';
import { body } from 'express-validator';
import { 
  createQuiz, 
  getModuleQuizzes,
  getCourseQuizzes,
  getQuiz, 
  updateQuiz, 
  deleteQuiz,
  getAllQuizzes
} from '../controllers/quizController.js';
import { 
  addQuestion, 
  updateQuestion, 
  deleteQuestion, 
  addOption, 
  updateOption, 
  deleteOption,
  getQuizQuestions
} from '../controllers/questionController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', authorize('instructor', 'admin'), getAllQuizzes);

// Quiz routes
router.post(
  '/',
  [
    body('title', 'Title is required').not().isEmpty(),
    body('courseId', 'Course ID is required when moduleId is not provided').optional().isInt(),
    body('moduleId', 'Module ID is required when courseId is not provided').optional().isInt(),
    body('passingScore').optional().isInt({ min: 0, max: 100 }),
    body('timeLimit').optional().isInt({ min: 1 }),
    body('maxAttempts').optional().isInt({ min: 1 }),
    body('shuffleQuestions').optional().isBoolean(),
    body('allowReview').optional().isBoolean(),
    body('status').optional().isIn(['draft', 'published']),
    body('isPreTest').optional().isBoolean(),
    body('isPostTest').optional().isBoolean()
  ],
  authorize('instructor'),
  createQuiz
);


router.get('/module/:moduleId', getModuleQuizzes);
router.get('/course/:courseId', getCourseQuizzes);
router.get('/:quizId', getQuiz);

router.put(
  '/:quizId',
  [
    body('title').optional().not().isEmpty(),
    body('passingScore').optional().isInt({ min: 0, max: 100 }),
    body('timeLimit').optional().isInt({ min: 1 }),
    body('maxAttempts').optional().isInt({ min: 1 }),
    body('shuffleQuestions').optional().isBoolean(),
    body('allowReview').optional().isBoolean(),
    body('status').optional().isIn(['draft', 'published'])
  ],
  authorize('instructor', 'admin'),
  updateQuiz
);

router.delete('/:quizId', authorize('instructor', 'admin'), deleteQuiz);

// Question routes
router.post(
  '/:quizId/questions',
  [
    body('text', 'Question text is required').not().isEmpty(),
    body('type').optional().isIn(['multiple_choice', 'true_false', 'short_answer', 'essay']),
    body('points').optional().isInt({ min: 1 }),
    body('position').optional().isInt({ min: 0 }),
    body('isRequired').optional().isBoolean()
  ],
  authorize('instructor', 'admin'),
  addQuestion
);

router.get('/:quizId/questions', getQuizQuestions);

router.put(
  '/questions/:questionId',
  [
    body('text').optional().not().isEmpty(),
    body('type').optional().isIn(['multiple_choice', 'true_false', 'short_answer', 'essay']),
    body('points').optional().isInt({ min: 1 }),
    body('position').optional().isInt({ min: 0 }),
    body('isRequired').optional().isBoolean()
  ],
  authorize('instructor', 'admin'),
  updateQuestion
);

router.delete('/questions/:questionId', authorize('instructor', 'admin'), deleteQuestion);

// Option routes
router.post(
  '/questions/:questionId/options',
  [
    body('text', 'Option text is required').not().isEmpty(),
    body('isCorrect').optional().isBoolean(),
    body('position').optional().isInt({ min: 0 })
  ],
  authorize('instructor', 'admin'),
  addOption
);

router.put(
  '/options/:optionId',
  [
    body('text').optional().not().isEmpty(),
    body('isCorrect').optional().isBoolean(),
    body('position').optional().isInt({ min: 0 })
  ],
  authorize('instructor', 'admin'),
  updateOption
);

router.delete('/options/:optionId', authorize('instructor', 'admin'), deleteOption);

export default router;
