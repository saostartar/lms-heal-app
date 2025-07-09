import axios from '@/lib/axios';
import ModuleDetailClient from './module-detail-client';


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