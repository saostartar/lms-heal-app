import axios from '@/lib/axios';
import ModuleDetailClient from './module-detail-client';
import { cookies } from 'next/headers';

// Fungsi ini memberitahu Next.js semua kombinasi course/module yang ada
export async function generateStaticParams() {
  try {
    const allParams = [];
    
    const coursesRes = await axios.get('/api/courses');
    const courses = coursesRes.data.data;
    if (!Array.isArray(courses)) return [];

    for (const course of courses) {
      const modulesRes = await axios.get(`/api/modules/course/${course.id}`);
      const modules = modulesRes.data.data;
      if (!Array.isArray(modules)) continue;

      for (const module of modules) {
        allParams.push({
          courseId: course.id.toString(),
          moduleId: module.id.toString(),
        });
      }
    }
    return allParams;
  } catch (error) {
    console.error("Gagal membuat static params untuk learner module detail:", error);
    return [];
  }
}

// Fungsi ini mengambil semua data yang diperlukan untuk halaman ini saat build
async function getModulePageData(courseId, moduleId) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  const config = token ? { headers: { Cookie: `token=${token.value}` } } : {};

  try {
    const modulePromise = axios.get(`/api/modules/${moduleId}`, config);
    const coursePromise = axios.get(`/api/courses/${courseId}`, config);
    const lessonsPromise = axios.get(`/api/lessons/module/${moduleId}`, config);
    const quizzesPromise = axios.get(`/api/quizzes/module/${moduleId}`, config);
    const progressPromise = axios.get(`/api/progress/module/${moduleId}`, config);

    const [
      moduleResult,
      courseResult,
      lessonsResult,
      quizzesResult,
      progressResult,
    ] = await Promise.allSettled([
      modulePromise,
      coursePromise,
      lessonsPromise,
      quizzesPromise,
      progressPromise,
    ]);

    const getResultData = (result) => result.status === 'fulfilled' ? result.value.data.data : null;
    const getResultError = (result) => result.status === 'rejected' ? (result.reason.response?.data?.message || result.reason.message) : null;

    const module = getResultData(moduleResult);
    const course = getResultData(courseResult);
    const lessons = getResultData(lessonsResult) || [];
    const quizzes = getResultData(quizzesResult) || [];
    const progress = getResultData(progressResult) || { lessons: [], quizzes: [] };
    
    const error = getResultError(moduleResult) || getResultError(courseResult);

    return { module, course, lessons, quizzes, progress, error };

  } catch (err) {
    console.error(`Gagal mengambil data untuk halaman modul ${moduleId}:`, err);
    return {
      module: null,
      course: null,
      lessons: [],
      quizzes: [],
      progress: { lessons: [], quizzes: [] },
      error: 'An unexpected error occurred while loading the page.',
    };
  }
}

// Ini adalah Server Component
export default async function ModuleDetailPage({ params }) {
  const { courseId, moduleId } = params;
  const { module, course, lessons, quizzes, progress, error } = await getModulePageData(courseId, moduleId);

  // Render Client Component dengan data awal dari server
  return (
    <ModuleDetailClient
      initialModule={module}
      initialCourse={course}
      initialLessons={lessons}
      initialQuizzes={quizzes}
      initialProgress={progress}
      initialError={error}
      params={params}
    />
  );
}