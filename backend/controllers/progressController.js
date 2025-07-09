import { validationResult } from 'express-validator';
import db from '../models/index.js';
// Import helper functions from the utils directory
import { 
  updateModuleProgressStatus, 
  updateEnrollmentProgress 
} from '../utils/progressHelpers.js';

const { Course, Module, Lesson, User, Enrollment, LessonProgress, ModuleProgress } = db;

// Update progress lesson
export const updateLessonProgress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lessonId } = req.params;
    const { status, timeSpent } = req.body;
    const userId = req.user.id;

    console.log('Updating lesson progress:', { lessonId, status, timeSpent, userId });

    // Cek apakah lesson ada
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ 
        model: Module, 
        include: [{ model: Course }] 
      }]
    });

    if (!lesson || !lesson.Module || !lesson.Module.Course) {
      return res.status(404).json({
        success: false,
        message: 'Lesson, associated Module, or Course not found'
      });
    }

    // Cek apakah user terdaftar dalam kursus ini
    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId: lesson.Module.Course.id
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'User not enrolled in this course'
      });
    }

    // Cari atau buat progress
    let progress = await LessonProgress.findOne({
      where: {
        userId,
        lessonId
      }
    });

    if (!progress) {
      progress = await LessonProgress.create({
        userId,
        lessonId,
        status: 'not_started',
        timeSpent: 0,
        lastAccessedAt: new Date()
      });
    }

    // Update status dan waktu
    const updatedData = {};
    
    if (status) {
      updatedData.status = status;
      // Only set completedAt if transitioning to completed
      if (status === 'completed' && progress.status !== 'completed') {
        updatedData.completedAt = new Date();
      } else if (status !== 'completed') {
         updatedData.completedAt = null;
      }
    }
    
    if (timeSpent) {
      updatedData.timeSpent = (progress.timeSpent || 0) + parseInt(timeSpent);
    }
    
    updatedData.lastAccessedAt = new Date();
    
    // Update progress
    progress = await progress.update(updatedData);
    console.log('Updated lesson progress:', progress.toJSON());

    // Update modul progress using the imported helper
    await updateModuleProgressStatus(userId, lesson.Module.id);
    console.log('Updated module progress for module:', lesson.Module.id);
    
    // Update enrollment progress using the imported helper
    await updateEnrollmentProgress(userId, lesson.Module.Course.id);
    console.log('Updated enrollment progress for course:', lesson.Module.Course.id);

    // Fetch updated enrollment to return current progress
    const updatedEnrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId: lesson.Module.Course.id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        lessonProgress: progress,
        enrollmentProgress: updatedEnrollment.progress,
        isCompleted: updatedEnrollment.isCompleted
      }
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    next(error);
  }
};

// Mendapatkan progress lesson untuk user tertentu
export const getLessonProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const progress = await LessonProgress.findOne({
      where: {
        userId,
        lessonId
      }
    });

    // It's okay if progress doesn't exist yet, return default state maybe?
    // Or return 404 as it currently does. Let's keep 404 for now.
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found for this lesson' // More specific message
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error("Error getting lesson progress:", error); // Add logging
    next(error);
  }
};

// Mendapatkan progress modul untuk user tertentu
export const getModuleProgress = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;

    // Find ModuleProgress first
    let progress = await ModuleProgress.findOne({
      where: {
        userId,
        moduleId
      }
    });

    // If ModuleProgress doesn't exist, it means the user hasn't started it
    // We might want to return a default 'not_started' state instead of 404
    if (!progress) {
       // Optionally, find the module to confirm it exists before returning default
       const moduleExists = await Module.findByPk(moduleId);
       if (!moduleExists) {
         return res.status(404).json({ success: false, message: 'Module not found' });
       }
       // Return a default progress object if module exists but progress doesn't
       return res.status(200).json({
         success: true,
         data: {
           userId,
           moduleId: parseInt(moduleId),
           status: 'not_started',
           progress: 0,
           // Include module details if needed by frontend
           Module: moduleExists 
         }
       });
    }

    // If progress exists, include associated data
     progress = await ModuleProgress.findOne({
      where: { userId, moduleId },
      include: [
        {
          model: Module,
          include: [
            {
              model: Lesson,
              include: [
                {
                  model: LessonProgress,
                  where: { userId },
                  required: false // Keep false to include lessons even without progress
                }
              ]
            }
          ]
        }
      ]
    });


    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error("Error getting module progress:", error); // Add logging
    next(error);
  }
};

// Mendapatkan progress kursus untuk user tertentu
export const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    console.log('Fetching course progress for:', { courseId, userId });

    // Check enrollment first
    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      }
    });

    if (!enrollment) {
      const courseExists = await Course.findByPk(courseId);
       if (!courseExists) {
         return res.status(404).json({ success: false, message: 'Course not found' });
       }
      return res.status(404).json({
        success: false,
        message: 'User is not enrolled in this course'
      });
    }

    // Fetch course with detailed progress
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Module,
          include: [
            {
              model: Lesson,
              include: [
                {
                  model: LessonProgress,
                  where: { userId },
                  required: false
                }
              ]
            },
            {
              model: ModuleProgress,
              where: { userId },
              required: false
            }
          ]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course details not found despite enrollment'
      });
    }

    // Calculate detailed progress
    const responseData = {
      enrollment: enrollment,
      course: {
        id: course.id,
        title: course.title,
        modules: course.Modules.map(mod => ({
          id: mod.id,
          title: mod.title,
          moduleProgress: mod.ModuleProgresses && mod.ModuleProgresses[0] ? {
             status: mod.ModuleProgresses[0].status,
             progress: mod.ModuleProgresses[0].progress,
             completedAt: mod.ModuleProgresses[0].completedAt,
             lastAccessedAt: mod.ModuleProgresses[0].lastAccessedAt
          } : { status: 'not_started', progress: 0 },
          lessons: mod.Lessons.map(les => ({
            id: les.id,
            title: les.title,
            lessonProgress: les.LessonProgresses && les.LessonProgresses[0] ? {
              status: les.LessonProgresses[0].status,
              timeSpent: les.LessonProgresses[0].timeSpent,
              completedAt: les.LessonProgresses[0].completedAt,
              lastAccessedAt: les.LessonProgresses[0].lastAccessedAt
            } : { status: 'not_started', timeSpent: 0 }
          }))
        }))
      },
      // Add summary statistics
      overallProgress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
      completionDate: enrollment.completionDate
    };

    console.log('Sending course progress response:', { 
      overallProgress: responseData.overallProgress,
      isCompleted: responseData.isCompleted 
    });

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Error getting course progress:", error);
    next(error);
  }
};

