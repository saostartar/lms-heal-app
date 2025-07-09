import axios from '@/lib/axios';
import EditCourseTestClient from './edit-course-test-client';

// Fungsi ini memberitahu Next.js semua ID course yang ada
export async function generateStaticParams() {
  try {
    const res = await axios.get('/api/courses');
    const courses = res.data.data;
    if (!Array.isArray(courses)) return [];

    // Kita akan generate halaman untuk semua course.
    // Logika untuk redirect jika test tidak ada akan ditangani di client.
    return courses.map((course) => ({
      courseId: course.id.toString(),
    }));
  } catch (error) {
    console.error("Gagal membuat static params untuk edit-test:", error);
    return [];
  }
}

// Fungsi ini mengambil data test untuk satu course spesifik saat build
async function getTestData(courseId) {
  try {
    const { data } = await axios.get(`/api/courses/${courseId}/tests`);

    // Jika tidak ada test, kembalikan null
    if ((!data.data.preTest && !data.data.preTestQuiz) || (!data.data.postTest && !data.data.postTestQuiz)) {
      return null;
    }

    const preTest = data.data.preTest || data.data.preTestQuiz;

    // Jika API utama tidak menyertakan pertanyaan, fetch secara terpisah
    if (!preTest.Questions && !preTest.questions) {
      const questionsResponse = await axios.get(`/api/quizzes/${preTest.id}/questions`);
      preTest.Questions = questionsResponse.data.data;
    }

    const questionsList = preTest.Questions || preTest.questions || [];

    // Format data untuk form
    const questions = questionsList.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type || "multiple-choice",
      points: q.points || 1,
      position: q.position || 0,
      options: (q.Options || q.options || []).map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    }));

    return {
      title: (preTest.title || "").replace(/ \(Pre-test\)$/, ""),
      description: preTest.description || "",
      questions: questions,
    };
  } catch (error) {
    // Jika terjadi error (misal 404 karena test tidak ada), anggap saja tidak ada data
    console.error(`Gagal mengambil data test untuk course ${courseId}:`, error.response?.data?.message || error.message);
    return null;
  }
}

// Ini adalah Server Component
export default async function EditCourseTestsPage({ params }) {
  const { courseId } = params;
  const testData = await getTestData(courseId);

  // Render Client Component dengan data awal dari server
  return <EditCourseTestClient initialData={testData} params={params} />;
}