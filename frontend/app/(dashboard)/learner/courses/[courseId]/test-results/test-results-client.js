'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Terima data awal sebagai props
export default function TestResultsClient({ initialComparison, initialError, params }) {
  const router = useRouter();
  const { courseId } = params;
  
  // Inisialisasi state dari props
  const [loading] = useState(!initialComparison && !initialError);
  const [error] = useState(initialError);
  const [comparison] = useState(initialComparison);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full absolute top-0 left-0 animate-spin animation-delay-150"></div>
        </div>
        <p className="mt-6 text-indigo-800 font-medium animate-pulse">Loading your learning journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-red-50 rounded-3xl shadow-lg border border-red-100">
        <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-6 text-center max-w-md">{error}</p>
        <Link href={`/learner/courses/${courseId}`} className="px-6 py-3 bg-white text-red-600 rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-medium">
          Return to Course
        </Link>
      </div>
    );
  }

  // Calculate percentage for progress ring
  const preTestScore = comparison.preTest.score;
  const postTestScore = comparison.postTest.score;
  const preTestCircumference = 2 * Math.PI * 30;
  const postTestCircumference = 2 * Math.PI * 30;
  const preTestOffset = preTestCircumference - (preTestScore / 100) * preTestCircumference;
  const postTestOffset = postTestCircumference - (postTestScore / 100) * postTestCircumference;
  
  // Calculate improved/declined questions count
  const improvedCount = comparison.comparison.questionComparison.filter(q => q.improved).length;
  const declinedCount = comparison.comparison.questionComparison.filter(q => q.declined).length;
  const unchangedCount = comparison.comparison.questionComparison.length - improvedCount - declinedCount;

  return (
    <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Link 
          href={`/learner/courses/${courseId}`} 
          className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Course
        </Link>
        
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
          <span className="block text-indigo-600">Learning Journey Results</span>
          <span className="block mt-1">{comparison.course.title}</span>
        </h1>
      </motion.div>
      
      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-2 p-1 bg-gray-100 rounded-xl max-w-md overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex-1 transition-all duration-200 ${
              activeTab === 'overview' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex-1 transition-all duration-200 ${
              activeTab === 'questions' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Questions
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex-1 transition-all duration-200 ${
              activeTab === 'insights' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Insights
          </button>
        </nav>
      </div>
      
      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Score Comparison */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 pt-6 pb-16 px-6">
              <h2 className="text-white text-xl font-bold">Your Knowledge Growth</h2>
              <p className="text-indigo-100">From pre-test to post-test assessment</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 -mt-10">
              {/* Pre-Test Score */}
              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Pre-Test</p>
                    <h3 className="text-3xl font-bold text-gray-700">{preTestScore.toFixed(1)}%</h3>
                  </div>
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="30"
                        fill="none"
                        stroke="#E0E7FF"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="30"
                        fill="none"
                        stroke="#818CF8"
                        strokeWidth="4"
                        strokeDasharray={preTestCircumference}
                        strokeDashoffset={preTestOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Completed on {new Date(comparison.preTest.date).toLocaleDateString()}
                </div>
              </div>
              
              {/* Improvement */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
                <div className="text-center">
                  {comparison.comparison.improvement > 0 ? (
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-4xl font-bold text-emerald-600 ml-2">+{comparison.comparison.improvement.toFixed(1)}%</span>
                    </div>
                  ) : comparison.comparison.improvement < 0 ? (
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-4xl font-bold text-rose-600 ml-2">{comparison.comparison.improvement.toFixed(1)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-4xl font-bold text-gray-500 ml-2">0%</span>
                    </div>
                  )}
                  <p className="text-indigo-800 font-medium">Overall Improvement</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {comparison.comparison.improvementPercentage > 0 
                      ? `${comparison.comparison.improvementPercentage}% growth from your initial assessment`
                      : comparison.comparison.improvementPercentage < 0
                        ? `${Math.abs(comparison.comparison.improvementPercentage)}% decline from your initial assessment`
                        : 'No change from your initial assessment'}
                  </p>
                </div>
              </div>
              
              {/* Post-Test Score */}
              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Post-Test</p>
                    <h3 className="text-3xl font-bold text-indigo-600">{postTestScore.toFixed(1)}%</h3>
                  </div>
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="30"
                        fill="none"
                        stroke="#E0E7FF"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="30"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="4"
                        strokeDasharray={postTestCircumference}
                        strokeDashoffset={postTestOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Completed on {new Date(comparison.postTest.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* Performance Breakdown */}
            <div className="px-6 py-8 border-t border-gray-100 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-100 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-700">{improvedCount}</div>
                      <div className="text-sm text-emerald-600">Improved Questions</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-rose-100 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-rose-700">{declinedCount}</div>
                      <div className="text-sm text-rose-600">Declined Questions</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-700">{unchangedCount}</div>
                      <div className="text-sm text-gray-600">Unchanged Questions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Questions Tab Content */}
      {activeTab === 'questions' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Question Analysis</h2>
          
          <div className="grid gap-6">
            {comparison.comparison.questionComparison.map((q, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl p-5 shadow-md border-l-4 ${
                  q.improved 
                    ? 'border-l-emerald-500 bg-emerald-50' 
                    : q.declined 
                      ? 'border-l-rose-500 bg-rose-50' 
                      : 'border-l-gray-300 bg-gray-50'
                }`}
              >
                <div className="mb-4">
                  <span className="inline-block bg-white px-2 py-1 rounded-md text-xs font-medium mb-2">
                    Question {index + 1}
                  </span>
                  <h3 className="text-lg font-medium text-gray-900">{q.question}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Pre-Test Answer</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        q.preTestCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.preTestCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 p-2 bg-gray-50 rounded">{q.preTestAnswer}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Post-Test Answer</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        q.postTestCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.postTestCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 p-2 bg-gray-50 rounded">{q.postTestAnswer}</p>
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  {q.improved ? (
                    <div className="inline-flex items-center text-emerald-600 text-sm font-medium">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      Improved
                    </div>
                  ) : q.declined ? (
                    <div className="inline-flex items-center text-rose-600 text-sm font-medium">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                      Declined
                    </div>
                  ) : (
                    <div className="inline-flex items-center text-gray-500 text-sm font-medium">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Unchanged
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Insights Tab Content */}
      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden"
        >
          <div className="flex items-center mb-6">
            <div className="p-3 bg-indigo-100 rounded-xl mr-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Learning Insights</h2>
          </div>
          
          <div className="prose prose-indigo max-w-none">
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <h3 className="text-xl font-semibold text-indigo-800 mb-4">Your Learning Journey</h3>
              <p className="text-gray-700">
                {comparison.comparison.improvement > 10 
                  ? "Excellent progress! You've shown significant improvement from your initial assessment to your final test."
                  : comparison.comparison.improvement > 0
                    ? "You've made good progress in your learning journey, showing improvement from your pre-test to post-test."
                    : comparison.comparison.improvement === 0
                      ? "Your scores remained consistent between tests. Consider reviewing the course material again to strengthen your understanding."
                      : "Your post-test score was lower than your pre-test. This might indicate areas that need additional review and reinforcement."}
              </p>
              
              <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 font-medium">1</span>
                  </div>
                  <h4 className="ml-3 font-semibold text-gray-800">Key Strengths</h4>
                </div>
                <div className="mt-2 ml-11">
                  {improvedCount > 0 ? (
                    <p className="text-gray-600">
                      You improved on {improvedCount} question{improvedCount !== 1 ? 's' : ''}, showing good progress in these areas.
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      Focus on maintaining your current knowledge while improving other areas.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 font-medium">2</span>
                  </div>
                  <h4 className="ml-3 font-semibold text-gray-800">Areas to Improve</h4>
                </div>
                <div className="mt-2 ml-11">
                  {declinedCount > 0 ? (
                    <p className="text-gray-600">
                      You might need additional review on {declinedCount} question{declinedCount !== 1 ? 's' : ''} where your performance declined.
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      Great job! You maintained or improved on all questions from pre-test to post-test.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold">Recommended Next Steps</h3>
            <ul className="space-y-4 mt-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Review challenging questions:</strong> Go back to the questions where your performance declined to strengthen your understanding.
                </p>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Apply your knowledge:</strong> Practice applying what you've learned in real-world scenarios to reinforce your understanding.
                </p>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Connect with peers:</strong> Discuss challenging concepts with your peers to gain new perspectives and insights.
                </p>
              </li>
            </ul>
          </div>
          
          <div className="mt-8 p-6 bg-indigo-900 text-white rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Keep Learning!</h3>
            <p className="text-indigo-100 mb-4">
              Your learning journey doesn't stop here. Continue to explore and expand your knowledge.
            </p>
            <Link 
              href={`/learner/courses/${courseId}`} 
              className="inline-flex items-center px-5 py-2 border border-indigo-300 text-sm leading-5 font-medium rounded-full text-white bg-indigo-800 hover:bg-indigo-700 transition-colors duration-200"
            >
              Return to Course
              <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}