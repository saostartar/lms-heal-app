import axios from '@/lib/axios';
import LessonDetailClient from './lesson-detail-client';

// Fungsi ini memberitahu Next.js semua kombinasi course/module/lesson yang ada
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

      // 3. Untuk setiap module, ambil semua lesson-nya
      for (const module of modules) {
        const lessonsRes = await axios.get(`/api/lessons/module/${module.id}`);
        const lessons = lessonsRes.data.data;
        if (!Array.isArray(lessons)) continue;

        // 4. Buat parameter untuk setiap lesson
        for (const lesson of lessons) {
          allParams.push({
            courseId: course.id.toString(),
            moduleId: module.id.toString(),
            lessonId: lesson.id.toString(),
          });
        }
      }
    }
    return allParams;
  } catch (error) {
    console.error("Gagal membuat static params untuk lessons:", error);
    return [];
  }
}

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