import axios from '@/lib/axios';
import CourseDetailClient from './course-detail-client';
import { cookies } from 'next/headers';

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
    console.error("Gagal membuat static params untuk course detail:", error);
    return [];
  }
}

// Fungsi ini mengambil semua data yang diperlukan untuk halaman ini saat build
async function getCoursePageData(courseId) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  const config = token ? { headers: { Cookie: `token=${token.value}` } } : {};

  try {
    const coursePromise = axios.get(`/api/courses/${courseId}`, config);
    const modulesPromise = axios.get(`/api/modules/course/${courseId}`, config);
    const enrollmentPromise = axios.get(`/api/learner/enrollments/course/${courseId}`, config);
    const accessStatusPromise = axios.get(`/api/analytics/course/${courseId}/access-status`, config);

    const [courseResult, modulesResult, enrollmentResult, accessStatusResult] = await Promise.allSettled([
      coursePromise,
      modulesPromise,
      enrollmentPromise,
      accessStatusPromise,
    ]);

    const getResultData = (result) => result.status === 'fulfilled' ? result.value.data.data : null;
    const getResultError = (result) => result.status === 'rejected' ? (result.reason.response?.data?.message || result.reason.message) : null;

    const course = getResultData(courseResult);
    if (!course) {
      return { error: getResultError(courseResult) || 'Failed to load course details.' };
    }

    const modules = getResultData(modulesResult);
    const enrollment = getResultData(enrollmentResult);
    const accessStatus = getResultData(accessStatusResult);
    let progressData = null;

    if (enrollment) {
      try {
        const progressResult = await axios.get(`/api/progress/course/${courseId}`, config);
        progressData = progressResult.data.data;
      } catch (progressErr) {
        console.error("Gagal mengambil data progress di server:", progressErr);
      }
    }

    return {
      course,
      modules,
      enrollment,
      progressData,
      accessStatus,
      error: null,
    };

  } catch (err) {
    console.error(`Gagal mengambil data untuk halaman course ${courseId}:`, err);
    return { error: 'An unexpected error occurred while loading the page.' };
  }
}

// Ini adalah Server Component
export default async function CourseDetailPage({ params }) {
  const { courseId } = params;
  const { 
    course, 
    modules, 
    enrollment, 
    progressData, 
    accessStatus, 
    error 
  } = await getCoursePageData(courseId);

  // Render Client Component dengan data awal dari server
  return (
    <CourseDetailClient
      initialCourse={course}
      initialModules={modules}
      initialEnrollment={enrollment}
      initialProgressData={progressData}
      initialAccessStatus={accessStatus}
      initialError={error}
      params={params}
    />
  );
}