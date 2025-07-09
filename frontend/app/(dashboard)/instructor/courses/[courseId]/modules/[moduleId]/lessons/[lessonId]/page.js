import axios from '@/lib/axios';
import LessonDetailClient from './lesson-detail-client';



// Fungsi ini mengambil data untuk satu lesson spesifik saat build
async function getLessonData(lessonId) {
  try {
    const { data } = await axios.get(`/api/lessons/${lessonId}`);
    return data.data;
  } catch (error) {
    console.error(`Gagal mengambil data untuk lesson ${lessonId}:`, error);
    return null;
  }
}

// Ini adalah Server Component
export default async function LessonDetailPage({ params }) {
  const { lessonId } = params;
  const lesson = await getLessonData(lessonId);

  // Render Client Component dengan data awal
  return <LessonDetailClient initialLesson={lesson} params={params} />;
}