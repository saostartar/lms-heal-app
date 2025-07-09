'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import QuestionForm from '@/components/instructor/QuestionForm';

export default function EditQuestionClient({ initialQuestion, params }) {
  const { courseId, moduleId, quizId, questionId } = params;
  const router = useRouter();
  
  // Gunakan data awal dari props
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(!initialQuestion); // Loading hanya jika tidak ada data awal
  const [error, setError] = useState(null);

  // useEffect ini sekarang menjadi fallback jika data dari server gagal dimuat
  useEffect(() => {
    if (!initialQuestion) {
      const fetchQuestion = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`/api/quizzes/questions/${questionId}`);
          setQuestion(data.data);
        } catch (err) {
          setError('Failed to load question: ' + (err.response?.data?.message || err.message));
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestion();
    }
  }, [questionId, initialQuestion]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!question) {
    return <div className="text-center">Question not found</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`} className="text-primary-600 hover:underline mb-2 inline-block">
          &larr; Back to quiz
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Edit Question</h1>
      
      <QuestionForm 
        courseId={courseId} 
        moduleId={moduleId} 
        quizId={quizId} 
        initialData={question}
        onError={setError}
      />
    </div>
  );
}