import axios from '@/lib/axios';
import CreateModuleClient from './create-module-client';

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
    console.error("Gagal membuat static params untuk create-module:", error);
    return [];
  }
}

// Fungsi ini mengambil data course saat build
async function getCourseData(courseId) {
  try {
    const { data } = await axios.get(`/api/courses/${courseId}`);
    return data.data;
  } catch (error) {
    console.error(`Gagal mengambil data untuk course ${courseId}:`, error);
    return null;
  }
}

// Ini adalah Server Component
export default async function CreateModulePage({ params }) {
  const { courseId } = params;
  const course = await getCourseData(courseId);

  // Render Client Component dengan data awal
  return <CreateModuleClient initialCourseTitle={course?.title} params={params} />;
}