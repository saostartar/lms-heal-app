import axios from '@/lib/axios';
import TakeQuizClient from './take-quiz-client';
import { cookies } from 'next/headers';

// Fungsi ini memberitahu Next.js semua ID kuis yang ada
export async function generateStaticParams() {
  try {
    const allParams = [];
    const coursesRes = await axios.get('/api/courses');
    const courses = coursesRes.data.data;
    if (!Array.isArray(courses)) return [];

    for (const course of courses) {
      const modulesRes = await axios.get(`/api/modules/course/${course.id}`);
      const modules = modulesRes.data.data;
      if (!Array.isArray(modules)) continue;

      for (const module of modules) {
        const quizzesRes = await axios.get(`/api/quizzes/module/${module.id}`);
        const quizzes = quizzesRes.data.data;
        if (!Array.isArray(quizzes)) continue;

        for (const quiz of quizzes) {
          allParams.push({
            quizId: quiz.id.toString(),
          });
        }
      }
    }
    return allParams;
  } catch (error) {
    console.error("Gagal membuat static params untuk take-quiz:", error);
    return [];
  }
}

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