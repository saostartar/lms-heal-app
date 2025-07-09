'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';
import ModuleForm from '@/components/instructor/ModuleForm';

export default function CreateModuleClient({ initialCourseTitle, params }) {
  const { courseId } = params;
  
  // Gunakan data awal dari props
  const [courseTitle, setCourseTitle] = useState(initialCourseTitle || '');
  const [loading, setLoading] = useState(!initialCourseTitle); // Loading hanya jika tidak ada data awal
  const [error, setError] = useState(null);

  // useEffect ini sekarang menjadi fallback jika data dari server gagal dimuat
  useEffect(() => {
    if (!initialCourseTitle) {
      const fetchCourse = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`/api/courses/${courseId}`);
          setCourseTitle(data.data.title);
        } catch (err) {
          setError('Failed to load course: ' + (err.response?.data?.message || err.message));
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [courseId, initialCourseTitle]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-r-4 border-transparent animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary-500 text-sm font-medium">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-6 rounded-lg shadow-md max-w-lg">
          <div className="flex items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Course</h3>
          </div>
          <p className="text-red-700">{error}</p>
          <Link href={`/instructor/courses/${courseId}`} className="mt-4 inline-flex items-center text-red-700 hover:text-red-900 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/instructor/courses/${courseId}`} className="text-primary-600 hover:text-primary-800 flex items-center mb-6 group transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Course</span>
        </Link>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 opacity-30 rounded-2xl transform rotate-1 scale-105"></div>
          <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-primary-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Add Module</h1>
                <p className="text-gray-600">Creating new content structure for your course</p>
              </div>
            </div>
            
            <div className="pl-16">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Course:</span>
                <span className="text-primary-700 font-medium">{courseTitle}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Modules help you organize your course content into logical sections
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ModuleForm courseId={courseId} />
    </div>
  );
}