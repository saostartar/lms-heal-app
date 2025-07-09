'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import QuestionForm from '@/components/instructor/QuestionForm';

export default function CreateQuestionClient({ params }) {
  const { courseId, moduleId, quizId } = params;
  const router = useRouter();
  const [error, setError] = useState(null);

  return (
    <div className="pb-16 animate-fade-in relative min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-indigo-50 rounded-full opacity-70 mix-blend-multiply filter blur-3xl"></div>
      <div className="absolute top-60 -left-20 w-80 h-80 bg-primary-50 rounded-full opacity-60 mix-blend-multiply filter blur-3xl"></div>
      <div className="absolute bottom-0 right-20 w-72 h-72 bg-secondary-50 rounded-full opacity-70 mix-blend-multiply filter blur-3xl"></div>
      
      {/* Page header with gradient accent */}
      <div className="relative mb-10 border-l-4 border-gradient-to-b from-primary-500 to-secondary-500 pl-6 py-2">
        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors group mb-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to quiz
        </Link>
        
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
          Create New Question
        </h1>
      </div>
      
      {/* Error notification */}
      {error && (
        <div className="relative mb-8 overflow-hidden bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 shadow-md animate-fade-in">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-red-100 rounded-full opacity-50 mix-blend-multiply filter blur-md"></div>
        </div>
      )}
      
      {/* Enhanced card for form */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/60 overflow-hidden">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-indigo-500"></div>
        <div className="p-8">
          <QuestionForm
            courseId={courseId}
            moduleId={moduleId}
            quizId={quizId}
            onError={setError}
          />
        </div>
      </div>
    </div>
  );
}