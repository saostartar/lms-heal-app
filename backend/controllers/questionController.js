import { validationResult } from 'express-validator';
import db from '../models/index.js';
import sequelize from '../config/db.js';

const { Quiz, Question, Option, Module, Course } = db;

// Add a question to a quiz
export const addQuestion = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quizId } = req.params;
    const { 
      text, 
      type, 
      points, 
      position, 
      explanation,
      imageUrl,
      isRequired,
      options // Extract options from request body
    } = req.body;

    // Check if quiz exists
    const quiz = await Quiz.findByPk(quizId, {
      include: [{ 
        model: Module,
        include: [{ model: Course }]
      }]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is the instructor of the course or admin
    if (req.user.role !== 'admin' && quiz.Module?.Course?.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add questions to this quiz'
      });
    }

    // Get max position if not provided
    let questionPosition = position;
    if (questionPosition === undefined) {
      const maxPositionQuestion = await Question.findOne({
        where: { quizId },
        order: [['position', 'DESC']]
      });
      questionPosition = maxPositionQuestion ? maxPositionQuestion.position + 1 : 0;
    }

    // Create question with transaction
    const question = await Question.create({
      quizId,
      text,
      type: type || 'multiple_choice',
      points: points || 1,
      position: questionPosition,
      explanation,
      imageUrl,
      isRequired: isRequired !== false
    }, { transaction });

    // Create options if they exist and question type is multiple_choice or true_false
    if (options && Array.isArray(options) && ['multiple_choice', 'true_false'].includes(type)) {
      // Validate true/false options
      if (type === 'true_false' && options.length !== 2) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'True/False questions must have exactly 2 options'
        });
      }
      
      // Validate at least one correct option for multiple choice
      if (type === 'multiple_choice' && !options.some(opt => opt.isCorrect)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least one correct option'
        });
      }

      // Create each option
      for (let i = 0; i < options.length; i++) {
        await Option.create({
          questionId: question.id,
          text: options[i].text,
          isCorrect: options[i].isCorrect || false,
          explanation: options[i].explanation || null,
          position: i,
          imageUrl: options[i].imageUrl || null
        }, { transaction });
      }
    }

    await transaction.commit();

    // Fetch the complete question with options to return
    const createdQuestion = await Question.findByPk(question.id, {
      include: [{ model: Option, order: [['position', 'ASC']] }]
    });

    res.status(201).json({
      success: true,
      data: createdQuestion
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Update a question
export const updateQuestion = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questionId } = req.params;
    const { 
      text, 
      type, 
      points, 
      position, 
      explanation,
      imageUrl,
      isRequired,
      options // Extract options from request body
    } = req.body;

    let question = await Question.findByPk(questionId, {
      include: [{ 
        model: Quiz,
        include: [{ 
          model: Module,
          include: [{ model: Course }]
        }]
      }]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the instructor of the course or admin
    if (req.user.role !== 'admin' && question.Quiz?.Module?.Course?.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question'
      });
    }

    // Update question with transaction
    question = await question.update({
      text: text || question.text,
      type: type || question.type,
      points: points || question.points,
      position: position !== undefined ? position : question.position,
      explanation: explanation !== undefined ? explanation : question.explanation,
      imageUrl: imageUrl !== undefined ? imageUrl : question.imageUrl,
      isRequired: isRequired !== undefined ? isRequired : question.isRequired
    }, { transaction });

    // Handle options update if provided and question type is multiple_choice or true_false
    if (options && Array.isArray(options) && ['multiple_choice', 'true_false'].includes(question.type)) {
      // Validate true/false options
      if (question.type === 'true_false' && options.length !== 2) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'True/False questions must have exactly 2 options'
        });
      }
      
      // Validate at least one correct option for multiple choice
      if (question.type === 'multiple_choice' && !options.some(opt => opt.isCorrect)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least one correct option'
        });
      }

      // Delete existing options
      await Option.destroy({
        where: { questionId: question.id },
        transaction
      });

      // Create new options
      for (let i = 0; i < options.length; i++) {
        await Option.create({
          questionId: question.id,
          text: options[i].text,
          isCorrect: options[i].isCorrect || false,
          explanation: options[i].explanation || null,
          position: i,
          imageUrl: options[i].imageUrl || null
        }, { transaction });
      }
    }

    await transaction.commit();

    // Fetch the updated question with options to return
    const updatedQuestion = await Question.findByPk(question.id, {
      include: [{ model: Option, order: [['position', 'ASC']] }]
    });

    res.status(200).json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Delete a question
export const deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByPk(questionId, {
      include: [{ 
        model: Quiz,
        include: [{ 
          model: Module,
          include: [{ model: Course }]
        }]
      }]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the instructor of the course or admin
    if (req.user.role !== 'admin' && question.Quiz?.Module?.Course?.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }

    await question.destroy();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add an option to a question
export const addOption = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questionId } = req.params;
    const { 
      text, 
      isCorrect, 
      explanation, 
      position,
      imageUrl
    } = req.body;

    // Check if question exists
    const question = await Question.findByPk(questionId, {
      include: [{ 
        model: Quiz,
        include: [{ 
          model: Module,
          include: [{ model: Course }]
        }]
      }]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the instructor of the course or admin
    if (req.user.role !== 'admin' && question.Quiz?.Module?.Course?.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add options to this question'
      });
    }

    // For true_false type, check if there are already 2 options
    if (question.type === 'true_false') {
      const optionCount = await Option.count({ where: { questionId } });
      if (optionCount >= 2) {
        return res.status(400).json({
          success: false,
          message: 'True/False questions can only have 2 options'
        });
      }
    }

    // Get max position if not provided
    let optionPosition = position;
    if (optionPosition === undefined) {
      const maxPositionOption = await Option.findOne({
        where: { questionId },
        order: [['position', 'DESC']]
      });
      optionPosition = maxPositionOption ? maxPositionOption.position + 1 : 0;
    }

    // Create option
    const option = await Option.create({
      questionId,
      text,
      isCorrect: isCorrect || false,
      explanation,
      position: optionPosition,
      imageUrl
    });

    res.status(201).json({
      success: true,
      data: option
    });
  } catch (error) {
    next(error);
  }
};

// Update an option
export const updateOption = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { optionId } = req.params;
    const { 
      text, 
      isCorrect, 
      explanation, 
      position,
      imageUrl
    } = req.body;

    let option = await Option.findByPk(optionId, {
      include: [{ 
        model: Question,
        include: [{ 
          model: Quiz,
          include: [{ 
            model: Module,
            include: [{ model: Course }]
          }]
        }]
      }]
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Option not found'
      });
    }

    // Check if user is the instructor of the course or admin
    if (req.user.role !== 'admin' && option.Question?.Quiz?.Module?.Course?.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this option'
      });
    }

    // Update option
    option = await option.update({
      text: text || option.text,
      isCorrect: isCorrect !== undefined ? isCorrect : option.isCorrect,
      explanation: explanation !== undefined ? explanation : option.explanation,
      position: position !== undefined ? position : option.position,
      imageUrl: imageUrl !== undefined ? imageUrl : option.imageUrl
    });

    res.status(200).json({
      success: true,
      data: option
    });
  } catch (error) {
    next(error);
  }
};

// Delete an option
export const deleteOption = async (req, res, next) => {
  try {
    const { optionId } = req.params;

    const option = await Option.findByPk(optionId, {
      include: [{ 
        model: Question,
        include: [{ 
          model: Quiz,
          include: [{ 
            model: Module,
            include: [{ model: Course }]
          }]
        }]
      }]
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Option not found'
      });
    }

    // Check if user is the instructor of the course or admin
    if (req.user.role !== 'admin' && option.Question?.Quiz?.Module?.Course?.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this option'
      });
    }

    await option.destroy();

    res.status(200).json({
      success: true,
      message: 'Option deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all questions for a quiz
export const getQuizQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    // Check if quiz exists
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const questions = await Question.findAll({
      where: { quizId },
      include: [{ model: Option, order: [['position', 'ASC']] }],
      order: [['position', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};