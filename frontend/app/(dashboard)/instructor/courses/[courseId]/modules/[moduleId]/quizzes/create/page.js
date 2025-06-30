'use client';

import { useEffect, useState } from 'react';
import axios from '../../../../../../../../../lib/axios';
import QuizForm from '../../../../../../../../../components/instructor/QuizForm';

export default function CreateQuiz({ params }) {
  const { courseId, moduleId } = params;
  const [moduleTitle, setModuleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/modules/${moduleId}`);
        setModuleTitle(data.data.title);
      } catch (err) {
        setError('Failed to load module: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-transparent border-t-secondary-500 animate-spin animation-delay-500"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-500 animate-pulse">Loading module...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-700">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative pb-8">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-12 -mt-6 hidden lg:block">
          <div className="w-40 h-40 bg-primary-50 rounded-full opacity-70 blur-xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 -ml-20 mb-12 hidden lg:block">
          <div className="w-32 h-32 bg-secondary-50 rounded-full opacity-70 blur-xl"></div>
        </div>
        
        {/* Header section */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 mb-2">
            <div className="h-0.5 w-6 bg-primary-500"></div>
            <span className="text-primary-600 font-medium text-sm">MODULE: {moduleTitle}</span>
          </div>
          <h1 className="text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-600">Create Quiz</h1>
          <p className="text-gray-500 mb-8 max-w-3xl">Design an assessment to evaluate student understanding of the module content</p>
        </div>

        {/* Card container with subtle animation */}
        <div className="relative transform transition-all duration-500 hover:scale-[1.01]">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-md opacity-20"></div>
          <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
            <QuizForm courseId={courseId} moduleId={moduleId} />
          </div>
        </div>
      </div>
    </div>
  );
}