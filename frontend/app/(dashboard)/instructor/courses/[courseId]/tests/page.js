import axios from '@/lib/axios';
import CourseTestsClient from './course-tests-client';

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
    console.error("Gagal membuat static params untuk course tests:", error);
    return [];
  }
}

// Fungsi ini mengambil data test untuk satu course spesifik saat build
async function getTestsData(courseId) {
  try {
    // Coba endpoint yang lebih efisien terlebih dahulu
    const { data } = await axios.get(`/api/courses/${courseId}/tests/with-questions`);
    const hasTests = Boolean(data.data.preTest) && Boolean(data.data.postTest);
    return {
      tests: {
        hasTests,
        requirePreTest: data.data.requirePreTest,
        preTest: data.data.preTest || {},
        postTest: data.data.postTest || {}
      },
      error: null
    };
  } catch (err) {
    // Jika endpoint pertama gagal, coba fallback
    try {
      const { data } = await axios.get(`/api/courses/${courseId}/tests`);
      
      let preTestWithQuestions = null;
      let postTestWithQuestions = null;
      
      if (data.data.preTestQuiz?.id) {
        const preTestResponse = await axios.get(`/api/quizzes/${data.data.preTestQuiz.id}?full=true`);
        preTestWithQuestions = preTestResponse.data.data;
      }
      
      if (data.data.postTestQuiz?.id) {
        const postTestResponse = await axios.get(`/api/quizzes/${data.data.postTestQuiz.id}?full=true`);
        postTestWithQuestions = postTestResponse.data.data;
      }
      
      const hasTests = Boolean(data.data.preTestQuiz) && Boolean(data.data.postTestQuiz);
      
      return {
        tests: {
          hasTests,
          requirePreTest: data.data.requirePreTest,
          preTest: preTestWithQuestions || data.data.preTestQuiz || {},
          postTest: postTestWithQuestions || data.data.postTestQuiz || {}
        },
        error: null
      };
    } catch (fallbackErr) {
      console.error('Gagal mengambil data test (fallback):', fallbackErr);
      return {
        tests: null,
        error: fallbackErr.response?.data?.message || 'Failed to load course tests'
      };
    }
  }
}

// Ini adalah Server Component
export default async function CourseTestsPage({ params }) {
  const { courseId } = params;
  const { tests, error } = await getTestsData(courseId);

  // Render Client Component dengan data awal dari server
  return (
    <CourseTestsClient 
      initialTests={tests} 
      initialError={error}
      params={params} 
    />
  );
}