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

    // Cek apakah lesson ada
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ 
        model: Module, 
        include: [{ model: Course }] 
      }]
    });

    if (!lesson || !lesson.Module || !lesson.Module.Course) { // Add checks for nested objects
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
      // Ensure lesson progress is only created if user is enrolled
      progress = await LessonProgress.create({
        userId,
        lessonId,
        status: 'not_started', // Initialize status
        timeSpent: 0,         // Initialize timeSpent
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
         // Ensure completedAt is null if status is not completed
         updatedData.completedAt = null;
      }
    }
    
    if (timeSpent) {
      // Ensure timeSpent is treated as an increment
      updatedData.timeSpent = (progress.timeSpent || 0) + parseInt(timeSpent);
    }
    
    updatedData.lastAccessedAt = new Date();
    
    // Only update if there are changes
    if (Object.keys(updatedData).length > 0) {
       progress = await progress.update(updatedData);
    }


    // Update modul progress using the imported helper
    await updateModuleProgressStatus(userId, lesson.Module.id);
    
    // Update enrollment progress using the imported helper
    await updateEnrollmentProgress(userId, lesson.Module.Course.id);

    res.status(200).json({
      success: true,
      data: progress // Return the potentially updated progress record
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error); // Add logging
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

    // Check enrollment first
    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      }
    });

    if (!enrollment) {
      // Check if the course itself exists before saying enrollment not found
      const courseExists = await Course.findByPk(courseId);
       if (!courseExists) {
         return res.status(404).json({ success: false, message: 'Course not found' });
       }
      return res.status(404).json({ // Or 403 Forbidden if course exists but user not enrolled
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
                  required: false // Keep false to include all lessons
                }
              ]
            },
            {
              model: ModuleProgress,
              where: { userId },
              required: false // Keep false to include all modules
            }
          ]
        }
      ]
    });

    // Course should exist if enrollment exists, but double-check
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course details not found despite enrollment' // Should not happen ideally
      });
    }

    // Structure the response data clearly
    const responseData = {
      enrollment: enrollment, // Contains overall progress and completion status
      course: {
        id: course.id,
        title: course.title,
        // Add other course details if needed
        modules: course.Modules.map(mod => ({
          id: mod.id,
          title: mod.title,
          moduleProgress: mod.ModuleProgresses && mod.ModuleProgresses[0] ? { // Get the specific user's progress
             status: mod.ModuleProgresses[0].status,
             progress: mod.ModuleProgresses[0].progress,
             completedAt: mod.ModuleProgresses[0].completedAt,
             lastAccessedAt: mod.ModuleProgresses[0].lastAccessedAt
          } : { status: 'not_started', progress: 0 }, // Default if no progress record
          lessons: mod.Lessons.map(les => ({
            id: les.id,
            title: les.title,
            lessonProgress: les.LessonProgresses && les.LessonProgresses[0] ? { // Get the specific user's progress
              status: les.LessonProgresses[0].status,
              timeSpent: les.LessonProgresses[0].timeSpent,
              completedAt: les.LessonProgresses[0].completedAt,
              lastAccessedAt: les.LessonProgresses[0].lastAccessedAt
            } : { status: 'not_started', timeSpent: 0 } // Default if no progress record
          }))
        }))
      }
    };


    res.status(200).json({
      success: true,
      data: responseData // Send the structured data
    });
  } catch (error) {
    console.error("Error getting course progress:", error); // Add logging
    next(error);
  }
};

