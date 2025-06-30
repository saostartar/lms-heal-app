import db from '../models/index.js';
const { Module, Lesson, LessonProgress, ModuleProgress, Enrollment, Course } = db;

// Helper function untuk update status modul progress
export const updateModuleProgressStatus = async (userId, moduleId) => {
  const module = await Module.findByPk(moduleId, {
    include: [{ model: Lesson }]
  });

  if (!module) return;

  // Ambil progress semua lesson dalam modul
  const lessonProgressList = await LessonProgress.findAll({
    where: {
      userId,
      lessonId: module.Lessons.map(lesson => lesson.id)
    }
  });

  // Cari atau buat module progress
  let moduleProgress = await ModuleProgress.findOne({
    where: {
      userId,
      moduleId
    }
  });

  if (!moduleProgress) {
    moduleProgress = await ModuleProgress.create({
      userId,
      moduleId
    });
  }

  // Hitung persentase progress
  const totalLessons = module.Lessons.length;
  const completedLessons = lessonProgressList.filter(lp => lp.status === 'completed').length;
  const inProgressLessons = lessonProgressList.filter(lp => lp.status === 'in_progress').length;
  
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  // Update status modul
  let status = 'not_started';
  if (completedLessons === totalLessons && totalLessons > 0) {
    status = 'completed';
  } else if (completedLessons > 0 || inProgressLessons > 0) {
    status = 'in_progress';
  }

  // Update data
  const updateData = {
    status,
    progress: progressPercentage,
    lastAccessedAt: new Date()
  };

  if (status === 'completed' && moduleProgress.status !== 'completed') {
    updateData.completedAt = new Date();
  }

  await moduleProgress.update(updateData);
};

// Helper function untuk update progress enrollment
export const updateEnrollmentProgress = async (userId, courseId) => {
  const course = await Course.findByPk(courseId, {
    include: [{ model: Module }]
  });

  if (!course) return;

  // Ambil progress semua modul dalam kursus
  const moduleProgressList = await ModuleProgress.findAll({
    where: {
      userId,
      moduleId: course.Modules.map(module => module.id)
    }
  });

  // Ambil enrollment
  const enrollment = await Enrollment.findOne({
    where: {
      userId,
      courseId
    }
  });

  if (!enrollment) return;

  // Hitung persentase progress
  const totalModules = course.Modules.length;
  const completedModules = moduleProgressList.filter(mp => mp.status === 'completed').length;
  
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  
  // Update data enrollment
  const updateData = {
    progress: progressPercentage,
    lastAccessedAt: new Date()
  };

  if (completedModules === totalModules && totalModules > 0) {
    updateData.isCompleted = true;
    updateData.completionDate = new Date();
  }

  await enrollment.update(updateData);
};
