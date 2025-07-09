"use client";

import { useState } from "react";
import Link from "next/link";

// Terima data awal sebagai props
export default function ModuleDetailClient({
  initialModule,
  initialCourse,
  initialLessons,
  initialQuizzes,
  initialProgress,
  initialError,
  params,
}) {
  const { courseId } = params;

  // Inisialisasi state dengan data dari server
  const [module] = useState(initialModule);
  const [course] = useState(initialCourse);
  const [lessons] = useState(initialLessons);
  const [quizzes] = useState(initialQuizzes);
  const [progress] = useState(initialProgress);
  const [loading] = useState(!initialModule && !initialError);
  const [error] = useState(initialError);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-8 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-indigo-600 font-medium animate-pulse">
          Loading your learning journey...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">
            Unable to Load Module
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            href={`/dashboard/learner/courses/${courseId}`}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 transform hover:scale-105 shadow-md">
            Return to Course
          </Link>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-6 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Module Not Found
        </h3>
        <p className="text-gray-600 mb-8 max-w-md">
          Sorry, we couldn't locate the module you're looking for. It may have
          been moved or removed.
        </p>
        <Link
          href={`/dashboard/learner/courses/${courseId}`}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          Return to Course
        </Link>
      </div>
    );
  }

  // Calculate progress percentage
  const completedLessons =
    progress.lessons?.filter((l) => l.completed)?.length || 0;
  const totalLessons = lessons.length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50 rounded-bl-full opacity-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-50 rounded-tr-full opacity-50 -z-10"></div>

      {/* Course navigation */}
      <nav className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href={`/learner/courses/${courseId}`}
            className="flex items-center text-indigo-700 font-medium group">
            <span className="flex h-8 w-8 mr-2 items-center justify-center rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="hidden md:inline">
              {course?.title || "Back to Course"}
            </span>
            <span className="inline md:hidden">Back</span>
          </Link>

          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full h-2 w-32 md:w-48 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <span className="text-sm font-semibold text-indigo-900 ml-3">
              {progressPercentage}%
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Module info card */}
        <div className="relative mb-12 overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>

          <div className="relative p-8 md:p-10 z-10">
            <h2 className="text-sm uppercase tracking-wider text-indigo-200 mb-2">
              Module {module.order || ""}
            </h2>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              {module.title}
            </h1>

            {module.description && (
              <div className="md:max-w-3xl text-indigo-100 text-lg leading-relaxed mb-6">
                <p>{module.description}</p>
              </div>
            )}

            <div className="flex items-center space-x-6 mt-8">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-indigo-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>
                  {lessons.length} Lesson{lessons.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-indigo-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>
                  {completedLessons} of {totalLessons} complete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <span className="bg-indigo-100 p-2 rounded-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </span>
            Module Lessons
          </h2>

          {lessons.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-gray-600 mb-2">
                No lessons available for this module yet.
              </p>
              <p className="text-gray-500 text-sm">
                Check back soon as new content is regularly added.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson, index) => {
                const lessonProgress = progress.lessons?.find(
                  (l) => l.lessonId === lesson.id
                );
                const completed = lessonProgress?.completed || false;

                return (
                  <div
                    key={lesson.id}
                    className={`relative group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      completed
                        ? "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100"
                        : "bg-white border border-gray-100 hover:border-indigo-200"
                    }`}>
                    {/* Lesson completion badge */}
                    {completed && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Completed
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start mb-4">
                        <div
                          className={`flex-shrink-0 rounded-full w-10 h-10 flex items-center justify-center mr-4 ${
                            completed
                              ? "bg-emerald-200 text-emerald-700"
                              : "bg-indigo-100 text-indigo-600"
                          }`}>
                          <span className="font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {lesson.title}
                          </h3>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {lesson.duration && (
                              <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {lesson.duration} min
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                completed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-indigo-100 text-indigo-800"
                              }`}>
                              {completed ? "Completed" : "Not Started"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/learner/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                        className={`mt-4 w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          completed
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}>
                        {completed ? (
                          <>
                            <span>Review Lesson</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Start Lesson</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quizzes section - New Section */}
        {quizzes && quizzes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="bg-purple-100 p-2 rounded-lg mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              Module Quizzes
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => {
                // Determine if quiz has been started or completed
                const quizProgress = progress.quizzes?.find(
                  q => q.quizId === quiz.id
                );
                const isCompleted = quizProgress?.completed || false;
                const score = quizProgress?.score || null;

                return (
                  <div
                    key={quiz.id}
                    className={`relative group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      isCompleted
                        ? "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
                        : "bg-white border border-gray-100 hover:border-purple-200"
                    }`}>
                    {isCompleted && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Completed
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start mb-4">
                        <div
                          className={`flex-shrink-0 rounded-full w-10 h-10 flex items-center justify-center mr-4 ${
                            isCompleted
                              ? "bg-blue-200 text-blue-700"
                              : "bg-purple-100 text-purple-600"
                          }`}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-purple-700 transition-colors">
                            {quiz.title}
                          </h3>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {quiz.timeLimit && (
                              <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {quiz.timeLimit} min
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                isCompleted
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}>
                              {isCompleted ? "Completed" : "Not Attempted"}
                            </span>
                          </div>
                          
                          {isCompleted && score !== null && (
                            <div className="mt-3 bg-white/50 p-2 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Score:</span>
                                <span className={`font-medium ${
                                  score >= quiz.passingScore 
                                    ? "text-green-600" 
                                    : "text-red-600"
                                }`}>
                                  {score}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    score >= quiz.passingScore 
                                      ? "bg-green-500" 
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/learner/quizzes/${quiz.id}`}
                        className={`mt-4 w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isCompleted
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}>
                        {isCompleted ? (
                          <>
                            <span>Retake Quiz</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Start Quiz</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Course progression */}
        {course && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Continue Your Learning Journey
            </h3>
            <Link
              href={`/learner/courses/${courseId}`}
              className="flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-md mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Return to Course Overview
                  </p>
                  <p className="text-sm text-gray-600">{course.title}</p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}