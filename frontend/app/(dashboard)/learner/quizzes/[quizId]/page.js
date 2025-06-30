'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios'; // Assuming axios is configured at this path

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { quizId } = params;

  const [quizAttempt, setQuizAttempt] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: { selectedOptionId: null, textAnswer: '' } }
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  const submitQuiz = useCallback(async () => {
    if (!quizAttempt || isSubmitting || submitted) return;

    console.log('Submitting quiz...');
    setIsSubmitting(true);
    setError(null);

    try {
     
      const response = await axios.post(`/api/quiz-attempts/${quizAttempt.id}/submit`);
      setResults(response.data.data);
      setSubmitted(true);
      setTimeLeft(null); // Stop timer
      console.log('Quiz submitted successfully:', response.data.data);
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(
        err.response?.data?.message ||
        'Failed to submit quiz. Please ensure all required questions are answered.'
      );
      if (err.response?.data?.unansweredQuestions) {
        
        console.log('Unanswered required questions:', err.response.data.unansweredQuestions);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [quizAttempt, isSubmitting, submitted ]); 


  // Fetch quiz and start attempt on load
  useEffect(() => {
    const startAttempt = async () => {
      if (!quizId) return;
      setLoading(true);
      setError(null);
      try {
        console.log(`Starting attempt for quiz ${quizId}`);
        const response = await axios.post(`/api/quiz-attempts/${quizId}/start`);
        const { quizAttempt: attemptData, quiz: details, questions: fetchedQuestions } = response.data.data;

        
        setQuizAttempt(attemptData);
        setQuizDetails(details);
        setQuestions(fetchedQuestions || []);
        // Initialize answers state based on fetched attempt data if resuming (not implemented here)
        setAnswers({}); // Reset answers for new attempt
        setCurrentQuestionIndex(0);
        setSubmitted(false);
        setResults(null);

        if (details.timeLimit) {
          // Consider fetching remaining time if resuming an attempt
          setTimeLeft(details.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (err) {
        console.error('Error starting quiz attempt:', err);
        setError(err.response?.data?.message || 'Failed to load quiz. You may not be enrolled or the quiz is unavailable.');
      } finally {
        setLoading(false);
      }
    };
    startAttempt();
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted || isSubmitting) {
      if (timeLeft === 0 && !submitted && quizAttempt?.status === 'in_progress') { // Ensure it only submits once
        console.log('Time is up! Submitting quiz automatically.');
        submitQuiz();
      }
      return; // Stop the interval
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime !== null && prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId); // Cleanup interval on unmount or dependency change
  }, [timeLeft, submitted, isSubmitting, submitQuiz, quizAttempt]);


  const saveAnswer = useCallback(async (questionId, answerData) => {
      // Debounce or throttle this function if needed to avoid excessive API calls
      if (!quizAttempt || isSavingAnswer || submitted) return;

      setIsSavingAnswer(true);
      // Clear previous save errors specific to this question?
      // setError(null);
      console.log(`Saving answer for question ${questionId}:`, answerData);

      try {
          await axios.post(
              `/api/quiz-attempts/${quizAttempt.id}/questions/${questionId}/answer`,
              answerData
          );
          console.log(`Answer for question ${questionId} saved successfully.`);
      } catch (err) {
          console.error(`Error saving answer for question ${questionId}:`, err);
          // Display a more specific, non-blocking error
          // Maybe use a toast notification library
          setError(`Failed to save answer for question ${questionId}. Your progress might not be saved.`);
      } finally {
          setIsSavingAnswer(false);
      }
  }, [quizAttempt, isSavingAnswer, submitted]);


  const handleAnswerChange = (questionId, value, type) => {
    if (submitted) return; // Don't allow changes after submission

    let newAnswerData = {};
    let updatedAnswers = { ...answers };

    if (type === 'multiple_choice' || type === 'true_false') {
      const selectedOptionId = parseInt(value);
      newAnswerData = { selectedOptionId };
      updatedAnswers[questionId] = { selectedOptionId, textAnswer: null };
    } else if (type === 'short_answer' || type === 'essay') {
      newAnswerData = { textAnswer: value };
      updatedAnswers[questionId] = { selectedOptionId: null, textAnswer: value };
    } else {
        console.warn(`Unhandled question type for answer change: ${type}`);
        return;
    }

    setAnswers(updatedAnswers);
    saveAnswer(questionId, newAnswerData); // Save answer immediately
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setError(null); // Clear error when navigating
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError(null); // Clear error when navigating
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

 // Loading state
 if (loading) {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 animate-pulse"></div>
        </div>
        <p className="text-indigo-800 mt-6 font-medium tracking-wider animate-pulse">LOADING QUIZ</p>
      </div>
    </div>
  );
}

// Error state
if (error && !quizAttempt) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 max-w-md w-full border border-red-200">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Unable to Load Quiz</h2>
        <p className="text-center text-red-600 mb-6 font-medium">{error}</p>
        <button 
          onClick={() => router.back()}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// Results view
if (submitted && results) {
  const isHighScore = results.score >= 80;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className={`h-3 ${isHighScore ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-red-500'}`}></div>
        
        <div className="p-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Quiz Complete!
          </h1>
          <h2 className="text-xl text-gray-600 mb-8">{quizDetails?.title}</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="w-40 h-40 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={isHighScore ? "#10b981" : "#f59e0b"}
                  strokeWidth="3"
                  strokeDasharray={`${results.score}, 100`}
                  className="animate-dash"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-800">{results.score?.toFixed(1)}%</span>
                <span className="text-sm text-gray-500">SCORE</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${isHighScore ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="font-semibold text-lg text-gray-800">
                  Status: <span className={isHighScore ? 'text-green-600' : 'text-amber-600'}>
                    {results.isPassed ? 'Passed' : 'Not Passed'}
                  </span>
                </span>
              </div>
              
              <div>
                <span className="text-gray-600 font-medium">Time Spent</span>
                <div className="bg-gray-100 rounded-full h-9 flex items-center pl-4 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">
                    {results.timeSpent ? `${Math.floor(results.timeSpent / 60)}m ${results.timeSpent % 60}s` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600 font-medium">Completed</span>
                <div className="bg-gray-100 rounded-full h-9 flex items-center pl-4 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-600 font-semibold hover:shadow-md transition duration-200 border border-indigo-200"
            >
              Return to Dashboard
            </button>
            
            {quizDetails?.allowReview && (
              <button
                onClick={() => router.push(`/learner/quizzes/review/${quizAttempt.id}`)}
                className="px-8 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-md transition duration-200"
              >
                Review Answers
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

if (!quizAttempt || !quizDetails || !questions || questions.length === 0) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 p-6 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md shadow-xl">
        <div className="flex justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Quiz Data Unavailable</h2>
        <p className="text-center text-gray-600 mb-6">Quiz data could not be loaded or is empty. {error}</p>
        <button
          onClick={() => router.back()}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-red-500 text-white rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// Ensure currentQuestionIndex is valid
if (currentQuestionIndex >= questions.length || currentQuestionIndex < 0) {
  console.error("Invalid currentQuestionIndex:", currentQuestionIndex, "Questions length:", questions.length);
  setCurrentQuestionIndex(0);
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 p-6 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md shadow-xl">
        <p className="text-center text-red-600 font-medium">Error loading current question.</p>
      </div>
    </div>
  );
}

const currentQuestion = questions[currentQuestionIndex];
if (!currentQuestion || !currentQuestion.id) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 p-6 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md shadow-xl">
        <p className="text-center text-red-600 font-medium">Error loading question data.</p>
      </div>
    </div>
  );
}

const currentAnswer = answers[currentQuestion.id] || { selectedOptionId: null, textAnswer: '' };
const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

// Main Quiz UI
return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
    {/* Top Header Section */}
    <div className="max-w-6xl mx-auto">
      <div className="relative mb-8">
        {/* Quiz Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {quizDetails.title}
          </h1>
          
          {/* Timer Display */}
          {timeLeft !== null && (
            <div className={`flex items-center space-x-2 ${
              timeLeft < 60 && timeLeft > 0 
                ? 'text-red-600' 
                : timeLeft < 300 
                  ? 'text-amber-600' 
                  : 'text-indigo-600'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${timeLeft < 60 && 'animate-pulse'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-mono font-semibold tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Question Counter */}
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{progressPercentage.toFixed(0)}% Complete</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Question */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Instructions Card */}
          {quizDetails.instructions && (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-indigo-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <h3 className="font-bold text-indigo-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instructions
              </h3>
              <p className="text-gray-700 text-sm">{quizDetails.instructions}</p>
            </div>
          )}
          
          {/* Question Card */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-purple-100 relative">
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md">
              {currentQuestion.points ?? 1} point{currentQuestion.points !== 1 && 's'}
            </div>
            
            {currentQuestion.isRequired && (
              <span className="absolute top-4 left-4 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                Required
              </span>
            )}
            
            <div className="mt-6">
              <p className="text-xl font-medium text-gray-800 leading-relaxed mb-4">
                {currentQuestion.text}
              </p>
              
              {currentQuestion.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-indigo-100 bg-white p-1">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Question visual" 
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Mini Navigation Controls for Mobile */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0 || isSubmitting || isSavingAnswer}
              className={`flex items-center p-2 rounded-lg ${
                currentQuestionIndex === 0 
                  ? 'opacity-50 bg-gray-100 text-gray-400' 
                  : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={isSubmitting || isSavingAnswer}
                className={`flex items-center p-2 rounded-lg ${
                  isSubmitting || isSavingAnswer
                    ? 'opacity-50 bg-gray-100 text-gray-400'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-md'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                {!isSubmitting && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={isSubmitting || isSavingAnswer}
                className={`flex items-center p-2 rounded-lg ${
                  isSubmitting || isSavingAnswer
                    ? 'opacity-50 bg-gray-100 text-gray-400'
                    : 'bg-white text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Right Column - Answers and Navigation */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100 relative">
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-transparent border-r-purple-100"></div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Select Your Answer
            </h2>
            
            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {/* Multiple Choice / True-False */}
              {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') && (
                <>
                  {(!currentQuestion.Options || currentQuestion.Options.length === 0) ? (
                    <p className="text-red-500 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Error: No options found for this question.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.Options.map((option) => (
                        <label
                          key={option.id}
                          htmlFor={`q${currentQuestion.id}-opt${option.id}`}
                          className={`relative flex cursor-pointer rounded-2xl border p-4 focus:outline-none transition-all duration-200 hover:shadow-md ${
                            currentAnswer.selectedOptionId === option.id
                              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2'
                              : 'border-gray-200 hover:border-indigo-200'
                          }`}
                        >
                          <input
                            type="radio"
                            id={`q${currentQuestion.id}-opt${option.id}`}
                            name={`question-${currentQuestion.id}`}
                            value={option.id}
                            checked={currentAnswer.selectedOptionId === option.id}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, currentQuestion.type)}
                            className="sr-only"
                            disabled={isSavingAnswer || isSubmitting || submitted}
                          />
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-x-4">
                              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                currentAnswer.selectedOptionId === option.id
                                  ? 'bg-indigo-500 text-white'
                                  : 'border border-gray-300 bg-white'
                              }`}>
                                {currentAnswer.selectedOptionId === option.id && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <p className={`text-gray-800 ${currentAnswer.selectedOptionId === option.id ? 'font-medium' : ''}`}>
                                  {option.text}
                                </p>
                                {option.imageUrl && (
                                  <img src={option.imageUrl} alt={`Option ${option.id}`} className="mt-2 max-w-xs h-auto rounded-lg border border-gray-200" />
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Short Answer */}
              {currentQuestion.type === 'short_answer' && (
                <div className="relative">
                  <input
                    type="text"
                    value={currentAnswer.textAnswer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, currentQuestion.type)}
                    className="w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent p-3 text-gray-800 placeholder-gray-400 transition-colors"
                    placeholder="Type your answer here..."
                    disabled={isSavingAnswer || isSubmitting || submitted}
                    maxLength={255}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                </div>
              )}

              {/* Essay Answer */}
              {currentQuestion.type === 'essay' && (
                <div className="rounded-2xl border border-gray-200 overflow-hidden transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-300">
                  <textarea
                    value={currentAnswer.textAnswer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, currentQuestion.type)}
                    className="w-full border-0 focus:ring-0 bg-white p-4 text-gray-800 placeholder-gray-400 resize-none min-h-[200px]"
                    placeholder="Write your detailed answer here..."
                    disabled={isSavingAnswer || isSubmitting || submitted}
                  ></textarea>
                  <div className="bg-gray-50 p-2 flex justify-between text-xs text-gray-500">
                    <span>Format your answer with detailed explanations</span>
                    <span>{currentAnswer.textAnswer?.length || 0} characters</span>
                  </div>
                </div>
              )}
              
              {/* Saving indicator */}
              <div className="h-5 text-sm">
                {isSavingAnswer && (
                  <div className="flex items-center text-indigo-600">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving your answer...
                  </div>
                )}
                {/* Display save error here if needed */}
                {error && !isSubmitting && <span className="text-red-500">{error}</span>}
              </div>
            </div>
            
            {/* Navigation Controls - Desktop */}
            <div className="hidden lg:flex justify-between items-center mt-8">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0 || isSubmitting || isSavingAnswer}
                className={`py-3 px-6 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                  currentQuestionIndex === 0 || isSubmitting || isSavingAnswer
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:shadow-md'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous Question</span>
              </button>
              
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  disabled={isSubmitting || isSavingAnswer}
                  className={`py-3 px-8 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                    isSubmitting || isSavingAnswer
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-1'
                  }`}
                >
                  <span>{isSubmitting ? 'Submitting Quiz...' : 'Submit Quiz'}</span>
                  {!isSubmitting && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={isSubmitting || isSavingAnswer}
                  className={`py-3 px-6 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                    isSubmitting || isSavingAnswer
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-1'
                  }`}
                >
                  <span>Next Question</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Submission error */}
            {error && isSubmitting && currentQuestionIndex === questions.length - 1 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}