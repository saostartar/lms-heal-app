import axios from '@/lib/axios';
import CoursePreviewClient from './course-preview-client';



// Fungsi ini mengambil semua data yang diperlukan untuk halaman ini saat build
async function getCoursePreviewData(courseId) {
  try {
    // Ambil data kursus dan modul secara paralel
    const coursePromise = axios.get(`/api/public/courses/${courseId}`);
    const modulesPromise = axios.get(`/api/public/modules/course/${courseId}?preview=true`);

    const [courseResult, modulesResult] = await Promise.allSettled([
      coursePromise,
      modulesPromise,
    ]);

    const getResultData = (result) => result.status === 'fulfilled' ? result.value.data.data : null;
    const getResultError = (result) => result.status === 'rejected' ? (result.reason.response?.data?.message || result.reason.message) : null;

    const course = getResultData(courseResult);
    if (!course) {
      return { error: getResultError(courseResult) || 'Failed to load course details.' };
    }

    const modules = getResultData(modulesResult) || [];
    let instructor = null;

    // Jika ada instructorId, ambil data instruktur
    if (course.instructorId) {
      try {
        const instructorResult = await axios.get(`/api/public/instructors/${course.instructorId}`);
        instructor = instructorResult.data.data;
      } catch (instructorErr) {
        console.warn(`Gagal mengambil data instruktur untuk course ${courseId}:`, instructorErr);
        // Tidak menganggap ini sebagai error fatal, halaman tetap bisa ditampilkan
      }
    }

    return {
      course,
      modules,
      instructor,
      error: null,
    };

  } catch (err) {
    console.error(`Gagal mengambil data untuk halaman preview course ${courseId}:`, err);
    return {
      course: null,
      modules: [],
      instructor: null,
      error: 'An unexpected error occurred while loading the page.',
    };
  }
}

// Ini adalah Server Component
export default async function CoursePreviewPage({ params }) {
  const { courseId } = params;
  const { course, modules, instructor, error } = await getCoursePreviewData(courseId);

  // Render Client Component dengan data awal dari server
  return (
    <CoursePreviewClient
      initialCourse={course}
      initialModules={modules}
      initialInstructor={instructor}
      initialError={error}
    />
  );
}