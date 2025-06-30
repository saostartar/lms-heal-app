import db from '../models/index.js';
import { Op } from 'sequelize';
const { User, Course, Module, Lesson, Enrollment, LessonProgress, ModuleProgress } = db;

// Fungsi untuk mendapatkan statistik kursus
export const getCourseStatistics = async (courseId) => {
  try {
    // Total enrollment
    const totalEnrollments = await Enrollment.count({
      where: { courseId }
    });

    // Enrollment yang sudah selesai
    const completedEnrollments = await Enrollment.count({
      where: { courseId, isCompleted: true }
    });

    // Rata-rata progres
    const enrollments = await Enrollment.findAll({
      where: { courseId },
      attributes: ['progress']
    });

    const avgProgress = enrollments.length > 0 
      ? enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length 
      : 0;

    // Jumlah user yang aktif dalam 7 hari terakhir
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const activeUsersLastWeek = await Enrollment.count({
      where: { 
        courseId,
        lastAccessedAt: {
          [Op.gte]: lastWeek // Fixed: use the imported Op instead of db.sequelize.Op
        }
      }
    });

    return {
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
      avgProgress,
      activeUsersLastWeek
    };
  } catch (error) {
    console.error('Error getting course statistics:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan statistik lesson
export const getLessonStatistics = async (lessonId) => {
  try {
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ 
        model: Module, 
        include: [{ model: Course }] 
      }]
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Total user yang mengakses lesson
    const totalViews = await LessonProgress.count({
      where: { lessonId }
    });

    // User yang menyelesaikan lesson
    const completedViews = await LessonProgress.count({
      where: { 
        lessonId,
        status: 'completed'
      }
    });

    // Rata-rata waktu yang dihabiskan (dalam detik)
    const progressRecords = await LessonProgress.findAll({
      where: { lessonId },
      attributes: ['timeSpent']
    });

    const avgTimeSpent = progressRecords.length > 0 
      ? progressRecords.reduce((sum, item) => sum + item.timeSpent, 0) / progressRecords.length 
      : 0;

    return {
      lessonTitle: lesson.title,
      courseId: lesson.Module.Course.id,
      courseTitle: lesson.Module.Course.title,
      totalViews,
      completedViews,
      completionRate: totalViews > 0 ? (completedViews / totalViews) * 100 : 0,
      avgTimeSpentSeconds: avgTimeSpent,
      avgTimeSpentFormatted: formatTime(avgTimeSpent)
    };
  } catch (error) {
    console.error('Error getting lesson statistics:', error);
    throw error;
  }
};

// Helper untuk memformat waktu dari detik ke format yang mudah dibaca
export const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  let result = '';
  if (hours > 0) {
    result += `${hours} jam `;
  }
  if (minutes > 0 || hours > 0) {
    result += `${minutes} menit `;
  }
  result += `${seconds} detik`;

  return result.trim();
};

// Fungsi untuk mendapatkan statistik pengguna
export const getUserLearningStatistics = async (userId) => {
  try {
    // Total kursus yang diikuti
    const totalEnrollments = await Enrollment.count({
      where: { userId }
    });

    // Kursus yang sudah selesai
    const completedCourses = await Enrollment.count({
      where: { 
        userId,
        isCompleted: true
      }
    });

    // Total waktu belajar (dalam detik)
    const lessonProgressRecords = await LessonProgress.findAll({
      where: { userId },
      attributes: ['timeSpent']
    });

    const totalLearningTime = lessonProgressRecords.reduce((sum, item) => sum + item.timeSpent, 0);

    // Aktivitas belajar 30 hari terakhir
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    
    const recentActivity = await LessonProgress.findAll({
      where: { 
        userId,
        lastAccessedAt: {
          [Op.gte]: lastMonth
        }
      },
      order: [['lastAccessedAt', 'DESC']],
      include: [{ 
        model: Lesson,
        attributes: ['id', 'title'],
        include: [{ 
          model: Module,
          attributes: ['id', 'title'],
          include: [{ 
            model: Course,
            attributes: ['id', 'title'] 
          }]
        }]
      }]
    });

    return {
      totalEnrollments,
      completedCourses,
      completionRate: totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0,
      totalLearningTimeSeconds: totalLearningTime,
      totalLearningTimeFormatted: formatTime(totalLearningTime),
      recentActivity
    };
  } catch (error) {
    console.error('Error getting user learning statistics:', error);
    throw error;
  }
};
