import axios from '@/lib/axios';
import QuizDetailClient from './quiz-detail-client';

// Fungsi ini memberitahu Next.js semua kombinasi course/module/quiz yang ada
export async function generateStaticParams() {
  try {
    const allParams = [];
    
    const coursesRes = await axios.get('/api/courses');
    const courses = coursesRes.data.data;
    if (!Array.isArray(courses)) {
      console.error("generateStaticParams (Quizzes): API /api/courses tidak mengembalikan array.");
      return [];
    }

    for (const course of courses) {
      const modulesRes = await axios.get(`/api/modules/course/${course.id}`);
      const modules = modulesRes.data.data;
      if (!Array.isArray(modules)) continue;

      for (const module of modules) {
        // Tambahkan path untuk halaman "create quiz" untuk setiap modul
        allParams.push({
          courseId: course.id.toString(),
          moduleId: module.id.toString(),
          quizId: 'create', // Halaman untuk membuat kuis baru
        });

        const quizzesRes = await axios.get(`/api/quizzes/module/${module.id}`);
        // Perbaikan: Akses array kuis langsung dari `quizzesRes.data.data`
        const quizzes = quizzesRes.data.data;
        if (!Array.isArray(quizzes)) continue;

        for (const quiz of quizzes) {
          allParams.push({
            courseId: course.id.toString(),
            moduleId: module.id.toString(),
            quizId: quiz.id.toString(),
          });
        }
      }
    }
    
    if (allParams.length === 0) {
      console.warn("generateStaticParams (Quizzes) tidak menghasilkan path. Periksa apakah ada kursus dan modul di database.");
    }

    return allParams;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error("Gagal membuat static params untuk Quizzes:", errorMsg);
    return [];
  }
}

// Fungsi ini mengambil data untuk satu kuis spesifik saat build
async function getQuizData(quizId) {
  // 'create' adalah kasus khusus, tidak perlu fetch data
  if (quizId === 'create') {
    return { quiz: null, questions: [], error: null };
  }

  try {
    const quizPromise = axios.get(`/api/quizzes/${quizId}`);
    const questionsPromise = axios.get(`/api/quizzes/${quizId}/questions`);

    const [quizRes, questionsRes] = await Promise.all([
      quizPromise,
      questionsPromise,
    ]);

    return {
      quiz: quizRes.data.data,
      questions: questionsRes.data.data || [],
      error: null,
    };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error(`Gagal mengambil data untuk quiz ${quizId}:`, errorMsg);
    return { quiz: null, questions: [], error: `Failed to load quiz data: ${errorMsg}` };
  }
}

// Ini adalah Server Component
export default async function QuizDetailPage({ params }) {
  const { quizId } = params;
  const { quiz, questions, error } = await getQuizData(quizId);

  // Render Client Component dengan data awal
  return <QuizDetailClient initialQuiz={quiz} initialQuestions={questions} initialError={error} params={params} />;
}