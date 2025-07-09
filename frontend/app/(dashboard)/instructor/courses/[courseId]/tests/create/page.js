import axios from '@/lib/axios';
import CreateCourseTestClient from './create-course-test-client';



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
export default async function CreateCourseTestPage({ params }) {
  const { courseId } = params;
  const course = await getCourseData(courseId);

  // Render Client Component dengan data awal
  return <CreateCourseTestClient initialCourseTitle={course?.title} params={params} />;
}