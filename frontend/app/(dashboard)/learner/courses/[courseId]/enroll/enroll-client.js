'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';

// Terima data awal sebagai props
export default function CourseEnrollClient({ initialCourse, initialError, params }) {
  const router = useRouter();
  const { courseId } = params;
  
  // Gunakan data awal dari props untuk inisialisasi state
  const [course] = useState(initialCourse);
  const [loading] = useState(!initialCourse && !initialError);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState(false);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await axios.post('/api/enrollments', { courseId });
      setSuccess(true);
      
      // Redirect ke halaman detail kursus setelah berhasil
      setTimeout(() => {
        router.push(`/learner/courses/${courseId}`);
      }, 1500);
    } catch (err) {
      setError('Failed to enroll in course: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">{error}</div>
        <Link href="/learner/courses" className="text-primary-600 hover:underline mt-4 inline-block">
          Browse other courses
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center p-4">
        <div className="text-gray-800">Course not found</div>
        <Link href="/learner/courses" className="text-primary-600 hover:underline mt-4 inline-block">
          Browse courses
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 p-8 rounded-md text-center">
        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="mt-4 text-lg font-medium text-green-800">Successfully enrolled!</h2>
        <p className="mt-2 text-sm text-green-700">
          You have been successfully enrolled in the course. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Enroll in Course</h1>
          
          <div className="mb-6 border-b pb-4">
            <h2 className="text-xl font-medium">{course.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                {course.category === 'mental_health' ? 'Mental Health' : 
                course.category === 'obesity' ? 'Obesity' : 'Other'}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
            </div>
            
            <p className="mt-4 text-gray-600">{course.description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">What you'll learn</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access to all course materials and resources</li>
              <li>Completion tracking for your progress</li>
              {course.preTestQuiz && (
                <li>Pre and post-tests to measure your knowledge improvement</li>
              )}
              <li>Certificate upon completion (if available)</li>
            </ul>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn btn-primary px-6 py-3"
            >
              {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
            
            <div className="mt-4">
              <Link href={`/learner/courses/${courseId}`} className="text-primary-600 hover:text-primary-800">
                Cancel and go back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}