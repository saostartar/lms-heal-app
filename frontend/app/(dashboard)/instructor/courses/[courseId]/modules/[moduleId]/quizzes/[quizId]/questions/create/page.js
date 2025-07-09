import axios from '@/lib/axios';
import CreateQuestionClient from './create-question-client';

// Fungsi ini memberitahu Next.js semua kombinasi course/module/quiz yang ada
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
            courseId: course.id.toString(),
            moduleId: module.id.toString(),
            quizId: quiz.id.toString(),
          });
        }
      }
    }
    return allParams;
  } catch (error) {
    console.error("Gagal membuat static params untuk create-question:", error);
    return [];
  }
}

// Ini adalah Server Component
export default async function CreateQuestionPage({ params }) {
  // Tidak perlu mengambil data spesifik, hanya meneruskan params
  // ke client component yang berisi form.
  return <CreateQuestionClient params={params} />;
}