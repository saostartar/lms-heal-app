'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';

export default function TestPreviewPage({ params }) {
  const { courseId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const testType = searchParams.get('type') || 'pre';
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses/${courseId}/tests`);
        const responseData = response.data;
        
        if (!responseData.success || !responseData.data) {
          setError('Failed to retrieve test data from the server.');
          return;
        }
        
        if (!responseData.data.preTestQuiz || !responseData.data.postTestQuiz) {
          setError('Tests are not yet set up for this course.');
          return;
        }
        
        // Select the appropriate test based on the type parameter
        const selectedTest = testType === 'post' 
          ? responseData.data.postTestQuiz 
          : responseData.data.preTestQuiz;
        
        // Load questions for the test
        try {
          const quizId = selectedTest.id;
          const questionsResponse = await axios.get(`/api/quizzes/${quizId}/questions`);
          
          if (questionsResponse.data.success && questionsResponse.data.data) {
            // Merge the questions with the test data
            selectedTest.Questions = questionsResponse.data.data;
          } else {
            // Initialize empty questions array if the request failed
            selectedTest.Questions = [];
          }
        } catch (questionsErr) {
          console.error('Error fetching questions:', questionsErr);
          // Initialize empty questions array if the request failed
          selectedTest.Questions = [];
        }
        
        setTest(selectedTest);
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err.response?.data?.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [courseId, testType]);

  return (
    <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {testType === 'post' ? 'Post-Test Preview' : 'Pre-Test Preview'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Preview how this test will appear to learners
            </p>
          </div>
          <Link
            href={`/instructor/courses/${courseId}/tests`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Tests
          </Link>
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
          <p className="mt-4 text-gray-500">Loading test preview...</p>
        </div>
      ) : test ? (
        <div className="bg-white shadow-md rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{test.title}</h2>
            {test.description && (
              <p className="mt-2 text-gray-600">{test.description}</p>
            )}
          </div>

          <div className="p-6">
            {test.Questions && test.Questions.length > 0 ? (
              <div className="space-y-8">
                {test.Questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start mb-4">
                      <div className="bg-gray-100 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{question.text}</h3>
                    </div>

                    {question.Options && question.Options.length > 0 && (
                      <div className="ml-9 space-y-3">
                        {question.Options.map((option) => (
                          <div key={option.id} className="flex items-center">
                            <div className={`h-5 w-5 border rounded-full mr-3 flex-shrink-0 ${option.isCorrect ? 'bg-green-50 border-green-500' : 'border-gray-300'}`}>
                              {option.isCorrect && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className={`flex-1 ${option.isCorrect ? 'font-medium text-green-700' : 'text-gray-700'}`}>
                              {option.text}
                              {option.isCorrect && (
                                <span className="ml-2 text-xs text-green-600">(Correct answer)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No questions have been added to this test.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-600">No test data available.</p>
        </div>
      )}
    </div>
  );
}