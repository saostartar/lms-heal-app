import axios from '@/lib/axios';
import CreateLessonClient from './create-lesson-client';

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
    console.error("Gagal membuat static params untuk create-lesson:", error);
    return [];
  }
}

// Fungsi ini mengambil data modul saat build
async function getModuleData(moduleId) {
  try {
    const { data } = await axios.get(`/api/modules/${moduleId}`);
    return data.data;
  } catch (error) {
    console.error(`Gagal mengambil data untuk module ${moduleId}:`, error);
    return null;
  }
}

// Ini adalah Server Component
export default async function CreateLessonPage({ params }) {
  const { moduleId } = params;
  const module = await getModuleData(moduleId);

  // Render Client Component dengan data awal
  return <CreateLessonClient initialModule={module} params={params} />;
}