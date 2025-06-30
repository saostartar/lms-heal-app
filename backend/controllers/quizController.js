import { validationResult } from "express-validator";
import db from "../models/index.js";
import { Op } from "sequelize"; // Add this missing import

const { Quiz, Question, Option, Module, Course, User, QuizAttempt, Answer } =
  db;



// Add this new function to handle /api/courses/quizzes endpoint
export const getAllQuizzes = async (req, res, next) => {
  try {
    // For instructors, only show quizzes from their courses
    const whereCondition = {};
    
    if (req.user.role !== 'admin') {
      // Instructor can only see their quizzes
      whereCondition['$or'] = [
        { '$Course.instructorId$': req.user.id },
        { '$Module.Course.instructorId$': req.user.id }
      ];
    }
    
    const quizzes = await Quiz.findAll({
      include: [
        {
          model: Module,
          required: false,
          include: [{ model: Course }]
        },
        {
          model: Course,
          required: false
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// Create a new quiz
export const createQuiz = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      moduleId,
      lessonId,
      passingScore,
      timeLimit,
      maxAttempts,
      instructions,
      shuffleQuestions,
      allowReview,
      status,
      courseId,
      isPreTest,
      isPostTest,
    } = req.body;

    // Create quiz based on what it's associated with
    if (courseId) {
      // This is a course-specific quiz (pre/post test)
      const course = await Course.findByPk(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check if user is the instructor of the course or admin
      if (req.user.role !== "admin" && course.instructorId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create quiz for this course",
        });
      }

      const quiz = await Quiz.create({
        title,
        description,
        courseId,
        moduleId: null,
        lessonId: null,
        passingScore: passingScore || 60,
        timeLimit,
        maxAttempts,
        instructions,
        shuffleQuestions: shuffleQuestions || false,
        allowReview: allowReview !== false,
        status: status || "draft",
        isPreTest: isPreTest || false,
        isPostTest: isPostTest || false,
      });

      res.status(201).json({
        success: true,
        data: quiz,
      });
    } else if (moduleId) {
      // This is a module-specific quiz
      const module = await Module.findByPk(moduleId, {
        include: [{ model: Course }],
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      // Check if user is the instructor of the course or admin
      if (
        req.user.role !== "admin" &&
        module.Course.instructorId !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create quiz for this module",
        });
      }

      // Create quiz
      const quiz = await Quiz.create({
        title,
        description,
        moduleId,
        lessonId,
        courseId: null,
        passingScore: passingScore || 60,
        timeLimit,
        maxAttempts,
        instructions,
        shuffleQuestions: shuffleQuestions || false,
        allowReview: allowReview !== false,
        status: status || "draft",
        isPreTest: false,
        isPostTest: false,
      });

      res.status(201).json({
        success: true,
        data: quiz,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Either courseId or moduleId is required",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get all quizzes for a module
export const getModuleQuizzes = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    // Check if module exists
    const module = await Module.findByPk(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const quizzes = await Quiz.findAll({
      where: { moduleId },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseQuizzes = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const quizzes = await Quiz.findAll({
      where: {
        courseId,
        [Op.or]: [{ isPreTest: true }, { isPostTest: true }],
      },
      order: [
        ["isPreTest", "DESC"], // Pre-tests first, then post-tests
        ["createdAt", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single quiz
export const getQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const includeOptions = [];

    // If query param 'full' is true, include questions and options
    if (req.query.full === "true") {
      includeOptions.push({
        model: Question,
        include: [{ model: Option }],
        order: [["position", "ASC"]],
      });
    }

    // Include module or course based on quiz type
    includeOptions.push({
      model: Module,
      required: false,
      include: [{ model: Course }],
    });

    includeOptions.push({
      model: Course,
      required: false,
    });

    const quiz = await Quiz.findByPk(quizId, {
      include: includeOptions,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// Update a quiz
export const updateQuiz = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quizId } = req.params;
    const {
      title,
      description,
      passingScore,
      timeLimit,
      maxAttempts,
      instructions,
      shuffleQuestions,
      allowReview,
      status,
    } = req.body;

    let quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Module,
          required: false,
          include: [{ model: Course }],
        },
        {
          model: Course, // Also include direct Course association
          required: false,
        }
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user is the instructor of the course or admin
    // Fixed logic: Changed && to || for proper authorization check
    if (
      req.user.role !== "admin" &&
      ((quiz.Module && quiz.Module.Course && quiz.Module.Course.instructorId !== req.user.id) ||
       !(quiz.Course && quiz.Course.instructorId === req.user.id))
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this quiz",
      });
    }

    // Update quiz
    quiz = await quiz.update({
      title: title || quiz.title,
      description: description !== undefined ? description : quiz.description,
      passingScore: passingScore || quiz.passingScore,
      timeLimit: timeLimit !== undefined ? timeLimit : quiz.timeLimit,
      maxAttempts: maxAttempts !== undefined ? maxAttempts : quiz.maxAttempts,
      instructions:
        instructions !== undefined ? instructions : quiz.instructions,
      shuffleQuestions:
        shuffleQuestions !== undefined
          ? shuffleQuestions
          : quiz.shuffleQuestions,
      allowReview: allowReview !== undefined ? allowReview : quiz.allowReview,
      status: status || quiz.status,
    });

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Module,
          required: false,
          include: [{ model: Course }],
        },
        {
          model: Course, // Also include direct Course association
          required: false,
        }
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Changed && to || for proper authorization check
    if (
      req.user.role !== "admin" &&
      ((quiz.Module && quiz.Module.Course && quiz.Module.Course.instructorId !== req.user.id) ||
       !(quiz.Course && quiz.Course.instructorId === req.user.id))
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this quiz",
      });
    }

    // Check if quiz has attempts
    const attemptCount = await QuizAttempt.count({ where: { quizId } });
    if (attemptCount > 0 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete quiz with existing attempts. Please contact an administrator.",
      });
    }

    await quiz.destroy();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};