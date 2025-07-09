import axios from '@/lib/axios';
import CourseEnrollClient from './enroll-client';

// Fungsi ini memberitahu Next.js semua ID course yang ada
export async function generateStaticParams() {
  try {
    const res = await axios.get('/api/courses');
    const courses = res.data.data;
    if (!Array.isArray(courses)) return [];

    return courses.map((course) => ({
      courseId: course.id.toString(),
    }));
  } catch (error) {
    console.error("Gagal membuat static params untuk enroll page:", error);
    return [];
  }
}

// Fungsi ini mengambil data untuk satu course spesifik saat build
async function getCourseData(courseId) {
  try {
    const { data } = await axios.get(`/api/courses/${courseId}`);
    return { course: data.data, error: null };
  } catch (error) {
    console.error(`Gagal mengambil data untuk course ${courseId}:`, error);
    return { course: null, error: 'Failed to load course details.' };
  }
}

// Ini adalah Server Component
export default async function CourseEnrollPage({ params }) {
  const { courseId } = params;
  const { course, error } = await getCourseData(courseId);

  // Render Client Component dengan data awal dari server
  return (
    <CourseEnrollClient 
      initialCourse={course} 
      initialError={error}
      params={params} 
    />
  );
}