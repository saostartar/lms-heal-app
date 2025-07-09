import axios from '@/lib/axios';
import TestResultsClient from './test-results-client';

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
    console.error("Gagal membuat static params untuk test-results:", error);
    return [];
  }
}

// Fungsi ini mengambil data perbandingan tes saat build
async function getTestResultsData(courseId) {
  try {
    const { data } = await axios.get(`/api/analytics/course/${courseId}/test-comparison`);
    return { comparison: data.data, error: null };
  } catch (error) {
    console.error(`Gagal mengambil data hasil tes untuk course ${courseId}:`, error);
    return { comparison: null, error: error.response?.data?.message || 'Failed to load test results.' };
  }
}

// Ini adalah Server Component
export default async function TestResultsPage({ params }) {
  const { courseId } = params;
  const { comparison, error } = await getTestResultsData(courseId);

  // Render Client Component dengan data awal dari server
  return (
    <TestResultsClient 
      initialComparison={comparison} 
      initialError={error}
      params={params} 
    />
  );
}