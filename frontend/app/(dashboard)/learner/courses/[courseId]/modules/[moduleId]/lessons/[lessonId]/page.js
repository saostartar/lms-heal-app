import axios from '@/lib/axios';
import LessonDetailClient from './lesson-detail-client';
import { cookies } from 'next/headers';



// Fungsi ini mengambil semua data yang diperlukan untuk halaman ini saat build
async function getLessonPageData(courseId, moduleId, lessonId) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  const config = token ? { headers: { Cookie: `token=${token.value}` } } : {};

  try {
    // Fetch semua data utama secara paralel
    const [lessonRes, courseRes, moduleRes, progressRes, moduleLessonsRes, courseModulesRes] = await Promise.all([
      axios.get(`/api/lessons/${lessonId}`, config),
      axios.get(`/api/courses/${courseId}`, config),
      axios.get(`/api/modules/${moduleId}`, config),
      axios.get(`/api/progress/course/${courseId}`, config),
      axios.get(`/api/lessons/module/${moduleId}`, config),
      axios.get(`/api/modules/course/${courseId}`, config),
    ]);

    const lesson = lessonRes.data.data;
    const course = courseRes.data.data;
    const module = moduleRes.data.data;
    const progress = progressRes.data.data;
    const moduleLessons = moduleLessonsRes.data.data;
    const courseModules = courseModulesRes.data.data;

    // Logika untuk mencari lesson sebelumnya dan berikutnya
    let prevLesson = null;
    let nextLesson = null;
    const currentLessonIndex = moduleLessons.findIndex(l => l.id === parseInt(lessonId));

    // Cari lesson sebelumnya
    if (currentLessonIndex > 0) {
      prevLesson = moduleLessons[currentLessonIndex - 1];
    } else {
      const currentModuleIndex = courseModules.findIndex(m => m.id === parseInt(moduleId));
      if (currentModuleIndex > 0) {
        const prevModule = courseModules[currentModuleIndex - 1];
        const { data: prevModuleLessonsData } = await axios.get(`/api/lessons/module/${prevModule.id}`, config);
        if (prevModuleLessonsData.data.length > 0) {
          prevLesson = {
            ...prevModuleLessonsData.data[prevModuleLessonsData.data.length - 1],
            moduleId: prevModule.id,
          };
        }
      }
    }

    // Cari lesson berikutnya
    if (currentLessonIndex < moduleLessons.length - 1) {
      nextLesson = moduleLessons[currentLessonIndex + 1];
    } else {
      const currentModuleIndex = courseModules.findIndex(m => m.id === parseInt(moduleId));
      if (currentModuleIndex < courseModules.length - 1) {
        const nextModule = courseModules[currentModuleIndex + 1];
        const { data: nextModuleLessonsData } = await axios.get(`/api/lessons/module/${nextModule.id}`, config);
        if (nextModuleLessonsData.data.length > 0) {
          nextLesson = {
            ...nextModuleLessonsData.data[0],
            moduleId: nextModule.id,
          };
        }
      }
    }
    
    // Pastikan attachments adalah array
    if (lesson.attachments && !Array.isArray(lesson.attachments)) {
      try {
        lesson.attachments = typeof lesson.attachments === 'string' ? JSON.parse(lesson.attachments) : [];
        if (!Array.isArray(lesson.attachments)) lesson.attachments = [];
      } catch (e) {
        lesson.attachments = [];
      }
    }

    return { lesson, course, module, progress, nextLesson, prevLesson, error: null };

  } catch (err) {
    console.error(`Gagal mengambil data untuk halaman lesson ${lessonId}:`, err);
    return {
      lesson: null, course: null, module: null, progress: null,
      nextLesson: null, prevLesson: null,
      error: err.response?.data?.message || 'Failed to load lesson data.',
    };
  }
}

// Ini adalah Server Component
export default async function LessonDetailPage({ params }) {
  const { courseId, moduleId, lessonId } = params;
  const { lesson, course, module, progress, nextLesson, prevLesson, error } = await getLessonPageData(courseId, moduleId, lessonId);

  return (
    <LessonDetailClient
      initialLesson={lesson}
      initialCourse={course}
      initialModule={module}
      initialProgress={progress}
      initialNextLesson={nextLesson}
      initialPrevLesson={prevLesson}
      initialError={error}
      params={params}
    />
  );
}