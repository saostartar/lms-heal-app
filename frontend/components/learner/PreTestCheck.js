"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "../../lib/axios";

export default function PreTestCheck({ courseId, children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `/api/analytics/course/${courseId}/access-status`
        );
        setAccessStatus(data);
      } catch (err) {
        setError(
          "Failed to check course access: " +
            (err.response?.data?.message || err.message)
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      checkAccess();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
          <div className="w-16 h-16 rounded-full border-r-4 border-l-4 border-primary-300 animate-spin absolute top-0 opacity-70" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          <div className="mt-6 text-gray-500 font-medium animate-pulse">Checking course access...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500 transform transition-all">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Error Occurred</h3>
              <p className="mt-1 text-sm text-gray-600">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 w-full inline-flex justify-center items-center space-x-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // If no pre-test required or user has already completed it, show the course content
  if (
    !accessStatus?.preTestRequired ||
    accessStatus?.preTestCompleted ||
    accessStatus?.canAccess
  ) {
    return <>{children}</>;
  }

  // Otherwise, show the pre-test requirement message with modern design
  return (
    <div className="py-12 px-4 min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl border border-gray-100">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-100 rounded-full opacity-30 mix-blend-multiply blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full opacity-30 mix-blend-multiply blur-xl"></div>
          
          <div className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-5 gap-8 items-center">
              {/* Left side - Content */}
              <div className="md:col-span-3 space-y-6">
                <div>
                  <span className="bg-primary-100 text-primary-800 text-xs uppercase font-semibold px-3 py-1 rounded-full">Required Assessment</span>
                  <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
                    Knowledge Check Required
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Before proceeding, we need to assess your current knowledge level.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14v4h2V6h-2zm0 6v2h2v-2h-2z" />
                    </svg>
                    Why is this important?
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    This pre-test measures your existing knowledge as a baseline. After completing the course, 
                    you'll take a post-test so we can measure your progress and knowledge gain. 
                    Don't worry - this won't affect your grade!
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative group">
                    <Link
                      href={`/learner/quizzes/${accessStatus.preTestId}`}
                      className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg shadow-lg hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform group-hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Start Pre-Test Now
                    </Link>
                    <div className="absolute -bottom-1 left-1/2 w-10 h-6 bg-primary-300 rounded blur-md -z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-200 transform -translate-x-1/2"></div>
                  </div>
                  
                  <span className="text-sm text-gray-500">Estimated time: 15-20 minutes</span>
                </div>
              </div>
              
              {/* Right side - Illustration */}
              <div className="md:col-span-2 flex justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-32 h-32 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom section - Steps */}
            <div className="mt-10 border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-600 mb-4">What to expect:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex space-x-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary-700 font-semibold">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Multiple-choice questions</p>
                    <p className="text-xs text-gray-500 mt-1">Answer at your own pace</p>
                  </div>
                </div>
                <div className="flex space-x-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary-700 font-semibold">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Instant results</p>
                    <p className="text-xs text-gray-500 mt-1">See your baseline knowledge</p>
                  </div>
                </div>
                <div className="flex space-x-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-primary-700 font-semibold">3</div>
                  <div>
                    <p className="font-medium text-gray-900">Unlock course content</p>
                    <p className="text-xs text-gray-500 mt-1">Start learning right away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}