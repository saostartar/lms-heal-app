import axios from '@/lib/axios';
import PreviewTestClient from './preview-test-client';

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
    console.error("Gagal membuat static params untuk test-preview:", error);
    return [];
  }
}

// Fungsi ini mengambil data test untuk satu course spesifik saat build
async function getTestData(courseId, testType) {
  let testData = null;
  let error = null;

  try {
    const response = await axios.get(`/api/courses/${courseId}/tests`);
    const responseData = response.data;

    if (!responseData.success || !responseData.data) {
      throw new Error('Failed to retrieve test data from the server.');
    }
    
    if (!responseData.data.preTestQuiz || !responseData.data.postTestQuiz) {
      throw new Error('Tests are not yet set up for this course.');
    }
    
    const selectedTest = testType === 'post' 
      ? responseData.data.postTestQuiz 
      : responseData.data.preTestQuiz;
    
    const quizId = selectedTest.id;
    const questionsResponse = await axios.get(`/api/quizzes/${quizId}/questions`);
    
    if (questionsResponse.data.success && questionsResponse.data.data) {
      selectedTest.Questions = questionsResponse.data.data;
    } else {
      selectedTest.Questions = [];
    }
    
    testData = selectedTest;

  } catch (err) {
    console.error(`Gagal mengambil data test preview untuk course ${courseId}:`, err.response?.data?.message || err.message);
    error = err.response?.data?.message || 'Failed to load test';
  }

  return { testData, error };
}

// Ini adalah Server Component
export default async function TestPreviewPage({ params, searchParams }) {
  const { courseId } = params;
  const testType = searchParams.type || 'pre';
  
  const { testData, error } = await getTestData(courseId, testType);

  // Render Client Component dengan data awal dari server
  return <PreviewTestClient initialTest={testData} initialError={error} params={params} />;
}