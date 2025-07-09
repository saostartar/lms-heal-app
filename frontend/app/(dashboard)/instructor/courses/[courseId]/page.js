import axios from '@/lib/axios';
import CourseDetailClient from './course-detail-client';


// Fungsi ini mengambil data untuk satu course spesifik saat build
async function getCourseData(courseId) {
  try {
    // Ambil semua data secara paralel
    const coursePromise = axios.get(`/api/courses/${courseId}?includeUnpublished=true&includeUnapproved=true`);
    const modulesPromise = axios.get(`/api/modules/course/${courseId}`);

    const [courseRes, modulesRes] = await Promise.all([
      coursePromise,
      modulesPromise,
    ]);

    return {
      course: courseRes.data.data,
      modules: modulesRes.data.data || [],
    };
  } catch (error) {
    console.error(`Gagal mengambil data untuk course ${courseId}:`, error);
    // Kembalikan data default jika gagal agar halaman tidak rusak
    return { course: null, modules: [] };
  }
}

// Ini adalah Server Component
export default async function CourseDetailPage({ params }) {
  const { courseId } = params;
  const { course, modules } = await getCourseData(courseId);

  // Render Client Component dengan data awal dari server
  return (
    <CourseDetailClient 
      initialCourse={course} 
      initialModules={modules}
      params={params} 
    />
  );
}