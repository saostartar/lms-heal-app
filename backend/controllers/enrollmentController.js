import { validationResult } from 'express-validator';
import db from '../models/index.js';

const { User, Course, Enrollment, Module, Lesson, ModuleProgress, LessonProgress } = db;


export const getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is authorized (instructor of the course or an admin)
    if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view enrollments for this course'
      });
    }
    
    // Get enrollments with user information
    const enrollments = await Enrollment.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// Enroll user dalam kursus
export const enrollCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'User already enrolled in this course'
      });
    }

    // Create new enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      progress: 0,
      isCompleted: false,
      lastAccessedAt: new Date()
    });

    // Initialize progress for all modules and lessons in the course
    const modules = await Module.findAll({
      where: { courseId },
      include: [{ model: Lesson }]
    });

    for (const module of modules) {
      await ModuleProgress.create({
        userId,
        moduleId: module.id,
        status: 'not_started',
        progress: 0
      });

      for (const lesson of module.Lessons) {
        await LessonProgress.create({
          userId,
          lessonId: lesson.id,
          status: 'not_started',
          timeSpent: 0
        });
      }
    }

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Error in enrollCourse:', error);
    next(error);
  }
};

// Mendapatkan semua kursus yang diikuti user
export const getEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'name', 'profileImage']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// Memeriksa status enrollment untuk kursus tertentu
export const getEnrollmentStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// Membatalkan enrollment pada kursus
export const unenrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Hapus semua progress terkait
    const modules = await Module.findAll({
      where: { courseId },
      include: [{ model: Lesson }]
    });

    for (const module of modules) {
      await ModuleProgress.destroy({
        where: {
          userId,
          moduleId: module.id
        }
      });

      for (const lesson of module.Lessons) {
        await LessonProgress.destroy({
          where: {
            userId,
            lessonId: lesson.id
          }
        });
      }
    }

    // Hapus enrollment
    await enrollment.destroy();

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    next(error);
  }
};
