import axios from '@/lib/axios';
import QuizDetailClient from './quiz-detail-client';



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