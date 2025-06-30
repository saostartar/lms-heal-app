import { validationResult } from "express-validator";
import db from "../models/index.js";
import LessonProgress from "../models/LessonProgress.js";
import ModuleProgress from "../models/ModuleProgress.js";
import {
  updateModuleProgressStatus,
  updateEnrollmentProgress,
} from "../utils/progressHelpers.js";

const {
  Quiz,
  Question,
  Option,
  User,
  QuizAttempt,
  Answer,
  Module,
  Course,
  Enrollment,
} = db;

// Start a quiz attempt
export const startQuizAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    // Check if quiz exists - include both Module and Course
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Module,
          include: [{ model: Course }],
        },
        {
          model: Course, // Add direct Course association for pre/post tests
        },
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if quiz is published
    if (quiz.status !== "published") {
      return res.status(403).json({
        success: false,
        message: "Quiz is not available for taking",
      });
    }

    // Determine the course for this quiz - either via module or direct association
    let course = null;

    if (quiz.Module && quiz.Module.Course) {
      // Quiz is associated with a module
      course = quiz.Module.Course;
    } else if (quiz.Course) {
      // Quiz is directly associated with a course (pre/post-test)
      course = quiz.Course;
    } else {
      return res.status(400).json({
        success: false,
        message: "Quiz is not properly associated with a module or course",
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId: course.id,
      },
    });

    if (!enrollment && req.user.role === "learner") {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to take the quiz",
      });
    }

    // Rest of the function remains the same
    // Check if user has exceeded maximum attempts
    if (quiz.maxAttempts !== null) {
      const attemptCount = await QuizAttempt.count({
        where: {
          quizId,
          userId,
        },
      });

      if (attemptCount >= quiz.maxAttempts) {
        return res.status(403).json({
          success: false,
          message: `Maximum number of attempts (${quiz.maxAttempts}) reached for this quiz`,
        });
      }
    }

    // Get attempt number
    const attemptCount = await QuizAttempt.count({
      where: {
        quizId,
        userId,
      },
    });

    // Create quiz attempt
    const quizAttempt = await QuizAttempt.create({
      quizId,
      userId,
      startTime: new Date(),
      status: "in_progress",
      attemptNumber: attemptCount + 1,
    });

    // Get quiz details
    let questions = await Question.findAll({
      where: { quizId },
      include: [
        {
          model: Option,
          attributes: ["id", "text", "position", "imageUrl"], // Exclude isCorrect
        },
      ],
      order: [
        ["position", "ASC"],
        [Option, "position", "ASC"],
      ],
    });

    // If shuffle is enabled, shuffle the questions
    if (quiz.shuffleQuestions) {
      questions = shuffleArray(questions);
    }

    // If shuffle is enabled, shuffle the options for each question
    if (quiz.shuffleQuestions) {
      questions.forEach((question) => {
        question.Options = shuffleArray(question.Options);
      });
    }

    res.status(201).json({
      success: true,
      data: {
        quizAttempt,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          instructions: quiz.instructions,
          timeLimit: quiz.timeLimit,
          totalQuestions: questions.length,
        },
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Submit an answer for a question
export const submitAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quizAttemptId, questionId } = req.params;
    const { selectedOptionId, textAnswer } = req.body;
    const userId = req.user.id;

    console.log(
      `Submitting answer - QuizAttemptId: ${quizAttemptId}, QuestionId: ${questionId}, UserId: ${userId}`
    );

    // Check if quiz attempt exists and belongs to user - add more detailed logging
    const quizAttempt = await QuizAttempt.findOne({
      where: {
        id: quizAttemptId,
        userId,
      },
      include: [
        {
          model: Quiz,
          include: [{ model: Course }], // Include Course directly for pre/post tests
        },
      ],
    });

    if (!quizAttempt) {
      // Log more detailed information for debugging
      console.error(
        `Quiz attempt not found - Attempted ID: ${quizAttemptId}, User: ${userId}`
      );

      // Try to find if the attempt exists at all (might belong to another user)
      const attemptExists = await QuizAttempt.findByPk(quizAttemptId);
      if (attemptExists) {
        console.error(
          `Quiz attempt exists but belongs to user ${attemptExists.userId}, not ${userId}`
        );
      }

      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found or does not belong to user",
        details:
          "Please ensure you're accessing the correct quiz attempt and try again.",
      });
    }

    // Check if quiz attempt is still in progress
    if (quizAttempt.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "This quiz attempt has already been submitted",
      });
    }

    // Check if question exists and belongs to the quiz
    const question = await Question.findOne({
      where: {
        id: questionId,
        quizId: quizAttempt.quizId,
      },
      include: [{ model: Option }],
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found or does not belong to this quiz",
      });
    }

    // Check for existing answer
    let answer = await Answer.findOne({
      where: {
        quizAttemptId,
        questionId,
      },
    });

    // For multiple choice and true/false questions
    if (["multiple_choice", "true_false"].includes(question.type)) {
      if (!selectedOptionId) {
        return res.status(400).json({
          success: false,
          message: "Selected option ID is required for this question type",
        });
      }

      // Check if option exists and belongs to the question
      const option = question.Options.find(
        (opt) => opt.id === parseInt(selectedOptionId)
      );
      if (!option) {
        return res.status(404).json({
          success: false,
          message: "Option not found or does not belong to this question",
        });
      }

      const isCorrect = option.isCorrect;
      const score = isCorrect ? question.points : 0;

      // Create or update answer
      if (answer) {
        answer = await answer.update({
          selectedOptionId,
          textAnswer: null,
          isCorrect,
          score,
        });
      } else {
        answer = await Answer.create({
          quizAttemptId,
          questionId,
          selectedOptionId,
          textAnswer: null,
          isCorrect,
          score,
        });
      }
    }
    // For short answer and essay questions
    else if (["short_answer", "essay"].includes(question.type)) {
      if (!textAnswer && textAnswer !== "") {
        return res.status(400).json({
          success: false,
          message: "Text answer is required for this question type",
        });
      }

      // For short answer, check against correct options
      let isCorrect = null;
      let score = null;

      if (question.type === "short_answer") {
        // Find a correct option that matches the text answer (case insensitive)
        const correctOption = question.Options.find(
          (opt) =>
            opt.isCorrect && opt.text.toLowerCase() === textAnswer.toLowerCase()
        );
        isCorrect = Boolean(correctOption);
        score = isCorrect ? question.points : 0;
      }

      // Create or update answer
      if (answer) {
        answer = await answer.update({
          selectedOptionId: null,
          textAnswer,
          isCorrect,
          score,
        });
      } else {
        answer = await Answer.create({
          quizAttemptId,
          questionId,
          selectedOptionId: null,
          textAnswer,
          isCorrect,
          score,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

// Submit the entire quiz attempt
export const submitQuizAttempt = async (req, res, next) => {
  try {
    const { quizAttemptId } = req.params;
    const userId = req.user.id;

    console.log(`Submitting quiz attempt - ID: ${quizAttemptId}, User: ${userId}`);

    // Check if quiz attempt exists and belongs to user with better course handling
    const quizAttempt = await QuizAttempt.findOne({
      where: {
        id: quizAttemptId,
        userId,
      },
      include: [
        {
          model: Quiz,
          include: [
            {
              model: Module,
              include: [{ model: Course }],
            },
            {
              model: Course, // Direct course association for pre/post tests
            },
          ],
        },
      ],
    });

    if (!quizAttempt) {
      console.error(`Quiz attempt not found during submission - ID: ${quizAttemptId}, User: ${userId}`);
      
      // Try to find if the attempt exists at all
      const attemptExists = await QuizAttempt.findByPk(quizAttemptId);
      if (attemptExists) {
        console.error(`Quiz attempt exists but belongs to user ${attemptExists.userId}, not ${userId}`);
      }
      
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found or does not belong to user",
        details: "The quiz attempt may have expired or been submitted already."
      });
    }

    // Check if quiz attempt is still in progress
    if (quizAttempt.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "This quiz attempt has already been submitted",
      });
    }

    // Get all questions for this quiz
    const questions = await Question.findAll({
      where: { quizId: quizAttempt.quizId },
      attributes: ["id", "points", "isRequired"],
    });

    // Get all answers for this attempt
    const answers = await Answer.findAll({
      where: { quizAttemptId },
    });

    // Check if all required questions have been answered
    const requiredQuestionIds = questions
      .filter((q) => q.isRequired)
      .map((q) => q.id);

    const answeredQuestionIds = answers.map((a) => a.questionId);

    const unansweredRequiredQuestions = requiredQuestionIds.filter(
      (id) => !answeredQuestionIds.includes(id)
    );

    if (unansweredRequiredQuestions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All required questions must be answered",
        unansweredQuestions: unansweredRequiredQuestions,
      });
    }

    // Calculate score
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = answers.reduce((sum, a) => sum + (a.score || 0), 0);

    const scorePercentage =
      totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    const isPassed = scorePercentage >= quizAttempt.Quiz.passingScore;

    // Calculate time spent
    const endTime = new Date();
    const timeSpent = Math.round(
      (endTime - new Date(quizAttempt.startTime)) / 1000
    ); // in seconds

    // Update quiz attempt
    await quizAttempt.update({
      status: "completed",
      endTime,
      score: scorePercentage,
      maxScore: totalPoints,
      isPassed,
      timeSpent,
    });

    if (quizAttempt.Quiz.lessonId) {
      // Update lesson progress
      let lessonProgress = await LessonProgress.findOne({
        where: {
          userId,
          lessonId: quizAttempt.Quiz.lessonId,
        },
      });

      if (lessonProgress) {
        await lessonProgress.update({
          status: isPassed ? "completed" : "in_progress",
          lastAccessedAt: new Date(),
          completedAt: isPassed ? new Date() : lessonProgress.completedAt,
        });

        // Update module dan enrollment progress
        // Safely check that Module and Course exist before using them
        if (quizAttempt.Quiz.Module) {
          await updateModuleProgressStatus(userId, quizAttempt.Quiz.Module.id);

          // Check if Course exists before trying to access its id
          if (quizAttempt.Quiz.Module.Course) {
            await updateEnrollmentProgress(
              userId,
              quizAttempt.Quiz.Module.Course.id
            );
          }
        }
      }
    }

    // Get details for response
    const quizAttemptWithDetails = await QuizAttempt.findByPk(quizAttemptId, {
      include: [
        { model: Quiz },
        {
          model: Answer,
          include: [{ model: Question }, { model: Option }],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: quizAttemptWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Get a quiz attempt with answers
export const getQuizAttempt = async (req, res, next) => {
  try {
    const { quizAttemptId } = req.params;
    const userId = req.user.id;

    const quizAttempt = await QuizAttempt.findOne({
      where: {
        id: quizAttemptId,
      },
      include: [
        {
          model: Quiz,
          include: [
            {
              model: Module,
              include: [{ model: Course }],
            },
          ],
        },
        {
          model: Answer,
          include: [
            {
              model: Question,
              include: [{ model: Option }],
            },
            { model: Option },
          ],
        },
      ],
    });

    if (!quizAttempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    // Check if user is authorized to view this attempt
    if (
      quizAttempt.userId !== userId &&
      req.user.role !== "admin" &&
      quizAttempt.Quiz &&
      quizAttempt.Quiz.Module &&
      quizAttempt.Quiz.Module.Course &&
      quizAttempt.Quiz.Module.Course.instructorId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this quiz attempt",
      });
    }

    res.status(200).json({
      success: true,
      data: quizAttempt,
    });
  } catch (error) {
    next(error);
  }
};

// Get all attempts for a quiz by a user
export const getUserQuizAttempts = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quizAttempts = await QuizAttempt.findAll({
      where: {
        quizId,
        userId,
      },
      order: [["attemptNumber", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: quizAttempts.length,
      data: quizAttempts,
    });
  } catch (error) {
    next(error);
  }
};

// Get all attempts for a quiz (for instructors)
export const getAllQuizAttempts = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    // Check if quiz exists and user is instructor or admin
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Module,
          include: [{ model: Course }],
        },
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user is authorized
    if (
      req.user.role !== "admin" &&
      quiz.Module &&
      quiz.Module.Course &&
      quiz.Module.Course.instructorId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view all attempts for this quiz",
      });
    }

    const quizAttempts = await QuizAttempt.findAll({
      where: { quizId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: quizAttempts.length,
      data: quizAttempts,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
