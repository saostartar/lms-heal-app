import axios from '@/lib/axios';
import TakeQuizClient from './take-quiz-client';
import { cookies } from 'next/headers';


// Fungsi ini memulai sesi kuis dan mengambil data awal saat build
async function getInitialQuizData(quizId) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  const config = token ? { headers: { Cookie: `token=${token.value}` } } : {};

  try {
    const response = await axios.post(`/api/quiz-attempts/${quizId}/start`, {}, config);
    const { quizAttempt, quiz, questions } = response.data.data;
    return {
      attempt: quizAttempt,
      details: quiz,
      questions: questions || [],
      error: null,
    };
  } catch (err) {
    console.error(`Gagal memulai kuis ${quizId}:`, err);
    return {
      attempt: null,
      details: null,
      questions: [],
      error: err.response?.data?.message || 'Failed to load quiz. You may not be enrolled or the quiz is unavailable.',
    };
  }
}

// Ini adalah Server Component
export default async function TakeQuizPage({ params }) {
  const { quizId } = params;
  const { attempt, details, questions, error } = await getInitialQuizData(quizId);

  // Render Client Component dengan data awal dari server
  return (
    <TakeQuizClient
      initialAttempt={attempt}
      initialDetails={details}
      initialQuestions={questions}
      initialError={error}
    />
  );
}