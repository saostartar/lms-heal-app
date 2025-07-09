import axios from '@/lib/axios';
import AdminCourseDetailClient from './course-detail-client';

export async function generateStaticParams() {
  try {
    const response = await axios.get('/api/courses');
    const courses = response.data.data;

    if (!Array.isArray(courses)) {
      console.error("generateStaticParams: API tidak mengembalikan array kursus.");
      return [];
    }

    return courses.map((course) => ({
      courseId: course.id.toString(),
    }));
  } catch (error) {
    console.error("Gagal mengambil data untuk generateStaticParams:", error);
    return [];
  }
}

async function getCourseData(courseId) {
  try {
    // Fetch all data in parallel
    const coursePromise = axios.get(`/api/courses/${courseId}`);
    const modulesPromise = axios.get(`/api/modules/course/${courseId}`);
    const enrollmentsPromise = axios.get(`/api/enrollments/course/${courseId}`);

    const [courseRes, modulesRes, enrollmentsRes] = await Promise.all([
      coursePromise,
      modulesPromise,
      enrollmentsPromise,
    ]);

    return {
      course: courseRes.data.data,
      modules: modulesRes.data.data,
      enrollments: enrollmentsRes.data.data || [],
    };
  } catch (error) {
    console.error("Gagal mengambil data kursus di server:", error);
    // Return nulls or empty arrays so the client component can handle it
    return { course: null, modules: [], enrollments: [] };
  }
}

export default async function AdminCourseDetailPage({ params }) {
  const { courseId } = params;
  const { course, modules, enrollments } = await getCourseData(courseId);

  return (
    <AdminCourseDetailClient 
      initialCourse={course}
      initialModules={modules}
      initialEnrollments={enrollments}
      params={params}
    />
  );
}