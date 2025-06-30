'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseTestForm from '../../../../../../../components/instructor/CourseTestForm';
import Link from 'next/link';

export default function CreateCourseTestPage({ params }) {
  const { courseId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="bg-primary-100 text-primary-800 p-2 rounded-lg mr-3 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                Create Course Assessment
              </h1>
              <p className="text-sm text-gray-500 ml-14">
                Create pre and post tests to measure learning outcomes for your course
              </p>
            </div>
            <Link
              href={`/instructor/courses/${courseId}/tests`}
              className="btn btn-outline group self-start md:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tests
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 border-b border-primary-800">
            <h2 className="text-lg font-medium text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Assessment Details
            </h2>
            <p className="mt-1 text-sm text-primary-100">
              This will create identical pre-test and post-test assessments to measure knowledge gain.
            </p>
          </div>
          
          <CourseTestForm courseId={courseId} />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help with your tests? Check out our <a href="#" className="text-primary-600 hover:text-primary-700">instructor guides</a> for tips.</p>
        </div>
      </div>
    </div>
  );
}