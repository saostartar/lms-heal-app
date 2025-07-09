import axios from '@/lib/axios';
import ModuleDetailClient from './module-detail-client';

// Fungsi ini memberitahu Next.js semua kombinasi course/module yang ada
export async function generateStaticParams() {
  try {
    const allParams = [];
    
    // 1. Ambil semua course
    const coursesRes = await axios.get('/api/courses');
    const courses = coursesRes.data.data;
    if (!Array.isArray(courses)) return [];

    // 2. Untuk setiap course, ambil semua module-nya
    for (const course of courses) {
      const modulesRes = await axios.get(`/api/modules/course/${course.id}`);
      const modules = modulesRes.data.data;
      if (!Array.isArray(modules)) continue;

      // 3. Buat parameter untuk setiap module
      for (const module of modules) {
        allParams.push({
          courseId: course.id.toString(),
          moduleId: module.id.toString(),
        });
      }
    }
    return allParams;
  } catch (error) {
    console.error("Gagal membuat static params untuk modules:", error);
    return [];
  }
}

// Fungsi ini mengambil data untuk satu modul spesifik saat build
async function getModuleData(moduleId) {
  try {
    // Ambil semua data secara paralel
    const modulePromise = axios.get(`/api/modules/${moduleId}`);
    const lessonsPromise = axios.get(`/api/lessons/module/${moduleId}`);
    const quizzesPromise = axios.get(`/api/quizzes/module/${moduleId}`);

    const [moduleRes, lessonsRes, quizzesRes] = await Promise.all([
      modulePromise,
      lessonsPromise,
      quizzesPromise,
    ]);

    return {
      module: moduleRes.data.data,
      lessons: lessonsRes.data.data || [],
      quizzes: quizzesRes.data.data || [],
    };
  } catch (error) {
    console.error(`Gagal mengambil data untuk module ${moduleId}:`, error);
    // Kembalikan data default jika gagal agar halaman tidak rusak
    return { module: null, lessons: [], quizzes: [] };
  }
}

// Ini adalah Server Component
export default async function ModuleDetailPage({ params }) {
  const { moduleId } = params;
  const { module, lessons, quizzes } = await getModuleData(moduleId);

  // Render Client Component dengan data awal dari server
  return (
    <ModuleDetailClient 
      initialModule={module} 
      initialLessons={lessons}
      initialQuizzes={quizzes}
      params={params} 
    />
  );
}