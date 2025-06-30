'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from '../../../../../../../../../lib/axios';
import QuizForm from '../../../../../../../../../components/instructor/QuizForm';

export default function QuizDetail({ params }) {
  const { courseId, moduleId, quizId } = params;
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        // Fetch quiz details
        const { data: quizData } = await axios.get(`/api/quizzes/${quizId}`);
        setQuiz(quizData.data);

        // Fetch quiz questions
        const { data: questionsData } = await axios.get(`/api/quizzes/${quizId}/questions`);
        setQuestions(questionsData.data);
      } catch (err) {
        setError('Failed to load quiz: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/quizzes/${quizId}`);
      router.push(`/instructor/courses/${courseId}/modules/${moduleId}`);
    } catch (err) {
      alert('Failed to delete quiz: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/quizzes/questions/${questionId}`);
      // Update the questions list
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      alert('Failed to delete question: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-primary-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center text-gray-500 py-12">Quiz not found</div>;
  }

  if (isEditing) {
    return (
      <div className="bg-gradient-to-br from-white to-primary-50/30 p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-600">
            Edit Quiz
          </h1>
          <button 
            onClick={() => setIsEditing(false)} 
            className="btn btn-outline hover:bg-white transition-all"
          >
            Cancel Editing
          </button>
        </div>
        <QuizForm courseId={courseId} moduleId={moduleId} initialData={quiz} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section with gradient background */}
      <div className="relative bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/dot-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="relative z-10 p-6">
          <Link 
            href={`/instructor/courses/${courseId}/modules/${moduleId}`} 
            className="inline-flex items-center text-white/90 hover:text-white mb-3 transition-all"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to module
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{quiz.title}</h1>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn bg-white text-primary-600 hover:bg-primary-50 hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Quiz
              </button>
              <button 
                onClick={handleDelete} 
                className="btn bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content grid with glass-card effect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quiz details panel */}
        <div className="md:col-span-2 card-glass">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Quiz Details</h2>
          </div>
          
          <div className="space-y-6 mt-6">
            {quiz.description && (
              <div className="bg-white/50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-1">Description</h3>
                <p className="text-gray-700">{quiz.description}</p>
              </div>
            )}
            
            {quiz.instructions && (
              <div className="bg-white/50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-1">Instructions</h3>
                <p className="text-gray-700">{quiz.instructions}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-white to-primary-50 p-4 rounded-lg border border-primary-100 shadow-sm">
                <h3 className="text-xs uppercase tracking-wider text-primary-700 mb-1">Passing Score</h3>
                <p className="text-2xl font-bold text-primary-800">{quiz.passingScore}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-white to-secondary-50 p-4 rounded-lg border border-secondary-100 shadow-sm">
                <h3 className="text-xs uppercase tracking-wider text-secondary-700 mb-1">Status</h3>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${quiz.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  <span className="text-black text-lg font-semibold">{quiz.status === 'published' ? 'Published' : 'Draft'}</span>
                </div>
              </div>
              
              {quiz.timeLimit && (
                <div className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                  <h3 className="text-xs uppercase tracking-wider text-blue-700 mb-1">Time Limit</h3>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-black text-lg font-semibold">{quiz.timeLimit} min</span>
                  </div>
                </div>
              )}
              
              {quiz.maxAttempts && (
                <div className="bg-gradient-to-br from-white to-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm">
                  <h3 className="text-xs uppercase tracking-wider text-purple-700 mb-1">Max Attempts</h3>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-black text-lg font-semibold">{quiz.maxAttempts}</span>
                  </div>
                </div>
              )}
              
              <div className="bg-gradient-to-br from-white to-emerald-50 p-4 rounded-lg border border-emerald-100 shadow-sm">
                <h3 className="text-xs uppercase tracking-wider text-emerald-700 mb-1">Shuffle Questions</h3>
                <div className="flex items-center">
                  <span className={` w-5 h-5 rounded-full mr-2 flex items-center justify-center ${quiz.shuffleQuestions ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {quiz.shuffleQuestions ? '✓' : '✗'}
                  </span>
                  <span className="text-black text-lg">{quiz.shuffleQuestions ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-amber-50 p-4 rounded-lg border border-amber-100 shadow-sm">
                <h3 className="text-xs uppercase tracking-wider text-amber-700 mb-1">Allow Review</h3>
                <div className="flex items-center">
                  <span className={` w-5 h-5 rounded-full mr-2 flex items-center justify-center ${quiz.allowReview ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                    {quiz.allowReview ? '✓' : '✗'}
                  </span>
                  <span className="text-black text-lg">{quiz.allowReview ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-12 -mr-12"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -mb-10 -ml-10"></div>
          
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Quiz Statistics
              </h2>
              <Link href={`/instructor/analytics/quizzes/${quizId}`} className="text-white/80 hover:text-white flex items-center transition-colors">
                Full Analytics
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Total Attempts</span>
                  <span className="font-bold text-xl">—</span>
                </div>
                <div className="w-full bg-white/20 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full animate-pulse" style={{width: '30%'}}></div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Avg. Score</span>
                  <span className="font-bold text-xl">—</span>
                </div>
                <div className="w-full bg-white/20 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Pass Rate</span>
                  <span className="font-bold text-xl">—</span>
                </div>
                <div className="w-full bg-white/20 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full animate-pulse" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions section */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100/50">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Questions <span className="ml-2 bg-primary-100 text-primary-800 text-sm py-0.5 px-2 rounded-full">{questions.length}</span>
            </h2>
            <Link 
              href={`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/questions/create`} 
              className="btn bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:from-primary-600 hover:to-primary-700 active:translate-y-0"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Question
            </Link>
          </div>
        </div>

        <div className="p-6">
          {questions.length === 0 ? (
            <div className="text-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No questions yet</h3>
              <p className="text-gray-500">Click "Add Question" to create your first question.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="group hover:bg-primary-50/30 transition-colors duration-300 border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex">
                      <div className="bg-primary-100 text-primary-700 font-medium text-sm h-8 w-8 rounded-full flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{question.text}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                            {question.type === 'multiple_choice' ? 'Multiple Choice' : 
                            question.type === 'true_false' ? 'True/False' : 
                            question.type === 'short_answer' ? 'Short Answer' : 'Essay'}
                          </span>
                          <span className="inline-flex items-center text-xs font-medium bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full">
                            {question.points} {question.points === 1 ? 'point' : 'points'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/questions/${question.id}`} 
                        className="p-2 hover:bg-primary-100 text-primary-700 rounded-full transition-colors"
                        title="Edit question"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button 
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-full transition-colors"
                        title="Delete question"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}