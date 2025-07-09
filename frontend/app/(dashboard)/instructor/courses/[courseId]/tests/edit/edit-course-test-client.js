"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CourseTestForm from "@/components/instructor/CourseTestForm";

export default function EditCourseTestClient({ initialData, params }) {
  const { courseId } = params;
  const router = useRouter();
  
  // State untuk error, loading dikontrol oleh ada atau tidaknya initialData
  const [error, setError] = useState(null);
  const loading = !initialData;

  // Redirect jika data tidak ditemukan saat server-side fetch
  useEffect(() => {
    if (!initialData && !loading) {
      router.push(`/instructor/courses/${courseId}/tests/create`);
    }
  }, [initialData, loading, courseId, router]);

  if (loading) {
    return (
      <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link
            href={`/instructor/courses/${courseId}/tests`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }
  
  // Jika initialData null setelah loading selesai, redirect akan terjadi.
  // Render form hanya jika initialData ada.
  return initialData ? (
    <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Course Assessment
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update your pre and post tests for this course
            </p>
          </div>
          <Link
            href={`/instructor/courses/${courseId}/tests`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 -ml-1"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Tests
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Edit Assessment</h2>
          <p className="mt-1 text-sm text-gray-500">
            Changes will be applied to both pre-test and post-test assessments.
          </p>
        </div>

        <CourseTestForm
          courseId={courseId}
          initialData={initialData}
          isEditing={true}
          apiEndpoint={`/api/courses/${courseId}/tests`}
          apiMethod="put"
        />
      </div>
    </div>
  ) : null; // Render null sementara menunggu redirect
}