'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';

export default function CourseTestsPage({ params }) {
  const { courseId } = params;
  const router = useRouter();
  const [tests, setTests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        // Updated to use the withQuestions endpoint to ensure questions are included
        const { data } = await axios.get(`/api/courses/${courseId}/tests/with-questions`);
        
        // Transform the data to include hasTests flag based on preTestQuiz existence
        const hasTests = Boolean(data.data.preTest) && Boolean(data.data.postTest);
        
        // Format the data to match the expected structure
        setTests({
          hasTests,
          requirePreTest: data.data.requirePreTest,
          preTest: data.data.preTest || {},
          postTest: data.data.postTest || {}
        });
      } catch (err) {
        // If the with-questions endpoint doesn't exist, fall back to the regular endpoint
        try {
          const { data } = await axios.get(`/api/courses/${courseId}/tests`);
          
          // Get the full test data with questions for each test
          let preTestWithQuestions = null;
          let postTestWithQuestions = null;
          
          if (data.data.preTestQuiz?.id) {
            const preTestResponse = await axios.get(`/api/quizzes/${data.data.preTestQuiz.id}?full=true`);
            preTestWithQuestions = preTestResponse.data.data;
          }
          
          if (data.data.postTestQuiz?.id) {
            const postTestResponse = await axios.get(`/api/quizzes/${data.data.postTestQuiz.id}?full=true`);
            postTestWithQuestions = postTestResponse.data.data;
          }
          
          const hasTests = Boolean(data.data.preTestQuiz) && Boolean(data.data.postTestQuiz);
          
          setTests({
            hasTests,
            requirePreTest: data.data.requirePreTest,
            preTest: preTestWithQuestions || data.data.preTestQuiz || {},
            postTest: postTestWithQuestions || data.data.postTestQuiz || {}
          });
        } catch (fallbackErr) {
          console.error('Error fetching tests:', fallbackErr);
          setError(fallbackErr.response?.data?.message || 'Failed to load course tests');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [courseId]);

  const handleDeleteTests = async () => {
    if (!window.confirm('Are you sure you want to delete both pre-test and post-test? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/courses/${courseId}/tests`);
      setTests({ hasTests: false });
    } catch (err) {
      console.error('Error deleting tests:', err);
      setError(err.response?.data?.message || 'Failed to delete tests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Tests</h1>
            <p className="text-sm text-gray-500 mt-1">Manage pre-test and post-test assessments</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/instructor/courses/${courseId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Course
            </Link>
            {!tests?.hasTests && (
              <Link
                href={`/instructor/courses/${courseId}/tests/create`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Tests
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

      {loading ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading tests...</p>
        </div>
      ) : !tests?.hasTests ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Tests Created Yet</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Create pre and post tests to measure your students' knowledge gain throughout the course.
          </p>
          <div className="mt-6">
            <Link
              href={`/instructor/courses/${courseId}/tests/create`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Tests
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Assessment Details</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Pre-test and post-test are set up for this course.
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/instructor/courses/${courseId}/tests/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Tests
                </Link>
                <button
                  onClick={handleDeleteTests}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete Tests
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Pre-Test</h3>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <div className="font-medium text-gray-500">Title:</div>
                    <div className="text-gray-900">{tests.preTest.title}</div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <div className="font-medium text-gray-500">Questions:</div>
                    <div className="text-gray-900">
                      {tests.preTest.Questions?.length || 
                       tests.preTest.questions?.length || 0}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/instructor/courses/${courseId}/tests/preview?type=pre`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      Preview Pre-Test
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Post-Test</h3>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <div className="font-medium text-gray-500">Title:</div>
                    <div className="text-gray-900">{tests.postTest.title}</div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <div className="font-medium text-gray-500">Questions:</div>
                    <div className="text-gray-900">
                      {tests.postTest.Questions?.length || 
                       tests.postTest.questions?.length || 0}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/instructor/courses/${courseId}/tests/preview?type=post`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      Preview Post-Test
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Settings: {tests.requirePreTest ? 'Pre-test required' : 'Pre-test optional'}
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        {tests.requirePreTest 
                          ? 'Students must complete the pre-test before accessing course content.' 
                          : 'Students can access course content without completing the pre-test.'}
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            await axios.put(`/api/courses/${courseId}/tests`, { 
                              requirePreTest: !tests.requirePreTest 
                            });
                            setTests({
                              ...tests,
                              requirePreTest: !tests.requirePreTest
                            });
                          } catch (err) {
                            setError(err.response?.data?.message || 'Failed to update settings');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-700 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        {tests.requirePreTest ? 'Make Pre-test Optional' : 'Make Pre-test Required'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}