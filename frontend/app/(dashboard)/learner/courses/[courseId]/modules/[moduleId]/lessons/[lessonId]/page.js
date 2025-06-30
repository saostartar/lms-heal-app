"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";

export default function LessonDetail() {
  const router = useRouter();
  const params = useParams();
  const { courseId, moduleId, lessonId } = params;

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [nextLesson, setNextLesson] = useState(null);
  const [prevLesson, setPrevLesson] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);

        // Fetch lesson details
        const { data: lessonData } = await axios.get(
          `/api/lessons/${lessonId}`
        );

        // Ensure attachments is always an array
        if (
          lessonData.data.attachments &&
          !Array.isArray(lessonData.data.attachments)
        ) {
          try {
            // If it's a JSON string, parse it
            if (typeof lessonData.data.attachments === "string") {
              lessonData.data.attachments = JSON.parse(
                lessonData.data.attachments
              );
            }
            // If it still isn't an array after parsing, make it an empty array
            if (!Array.isArray(lessonData.data.attachments)) {
              lessonData.data.attachments = [];
            }
          } catch (e) {
            // If parsing fails, set to empty array
            lessonData.data.attachments = [];
          }
        }

        setLesson(lessonData.data);

        // Fetch course details
        const { data: courseData } = await axios.get(
          `/api/courses/${courseId}`
        );
        setCourse(courseData.data);

        // Fetch module details
        const { data: moduleData } = await axios.get(
          `/api/modules/${moduleId}`
        );
        setModule(moduleData.data);

        // Fetch user progress for this course
        const { data: progressData } = await axios.get(
          `/api/progress/course/${courseId}`
        );
        setProgress(progressData.data);

        // Fetch all lessons in the current module to determine next/prev
        const { data: lessonListData } = await axios.get(
          `/api/lessons/module/${moduleId}`
        );
        const lessons = lessonListData.data;

        // Find current lesson index
        const currentIndex = lessons.findIndex(
          (l) => l.id === parseInt(lessonId)
        );

        // Set previous lesson if available
        if (currentIndex > 0) {
          setPrevLesson(lessons[currentIndex - 1]);
        } else {
          // If at first lesson of this module, check if there's a previous module
          const { data: modulesData } = await axios.get(
            `/api/modules/course/${courseId}`
          );
          const modules = modulesData.data;
          const currentModuleIndex = modules.findIndex(
            (m) => m.id === parseInt(moduleId)
          );

          if (currentModuleIndex > 0) {
            // Get last lesson of previous module
            const prevModuleId = modules[currentModuleIndex - 1].id;
            const { data: prevModuleLessonsData } = await axios.get(
              `/api/lessons/module/${prevModuleId}`
            );

            if (prevModuleLessonsData.data.length > 0) {
              setPrevLesson({
                ...prevModuleLessonsData.data[
                  prevModuleLessonsData.data.length - 1
                ],
                moduleId: prevModuleId,
              });
            }
          }
        }

        // Set next lesson if available
        if (currentIndex < lessons.length - 1) {
          setNextLesson(lessons[currentIndex + 1]);
        } else {
          // If at last lesson of this module, check if there's a next module
          const { data: modulesData } = await axios.get(
            `/api/modules/course/${courseId}`
          );
          const modules = modulesData.data;
          const currentModuleIndex = modules.findIndex(
            (m) => m.id === parseInt(moduleId)
          );

          if (currentModuleIndex < modules.length - 1) {
            // Get first lesson of next module
            const nextModuleId = modules[currentModuleIndex + 1].id;
            const { data: nextModuleLessonsData } = await axios.get(
              `/api/lessons/module/${nextModuleId}`
            );

            if (nextModuleLessonsData.data.length > 0) {
              setNextLesson({
                ...nextModuleLessonsData.data[0],
                moduleId: nextModuleId,
              });
            }
          }
        }
      } catch (err) {
        setError(
          "Failed to load lesson: " +
            (err.response?.data?.message || err.message)
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, moduleId, courseId]);

  const markAsCompleted = async () => {
    try {
      setCompletingLesson(true);
      // Using the correct endpoint with PUT method and sending the status
      await axios.put(`/api/progress/lesson/${lessonId}`, {
        status: "completed",
      });

      // Refresh progress data
      const { data: progressData } = await axios.get(
        `/api/progress/course/${courseId}`
      );
      setProgress(progressData.data);

      // If there's a next lesson, go to it
      if (nextLesson) {
        router.push(
          `/learner/courses/${courseId}/modules/${
            nextLesson.moduleId || moduleId
          }/lessons/${nextLesson.id}`
        );
      } else {
        // Otherwise, go back to the course page and show completion message
        router.push(`/learner/courses/${courseId}?completed=true`);
      }
    } catch (err) {
      setError(
        "Failed to mark lesson as completed: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setCompletingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center text-primary-600 font-bold">
              Loading
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-lg w-full transform hover:scale-105 transition-transform duration-300">
          <div className="bg-red-600 h-2"></div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <svg
                  className="h-6 w-6 text-red-600"
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
              <h3 className="text-lg font-bold text-gray-900">
                Something went wrong
              </h3>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href={`/learner/courses/${courseId}`}
              className="inline-block w-full text-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors duration-300">
              Back to course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-lg w-full text-center p-8 transform hover:scale-105 transition-transform duration-300">
          <svg
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Lesson not found
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't find the lesson you're looking for.
          </p>
          <Link
            href={`/learner/courses/${courseId}/modules/${moduleId}`}
            className="inline-block py-2 px-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full shadow-md transition-colors duration-300">
            Back to module
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white bg-opacity-90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/learner/courses/${courseId}`}
                className="inline-flex items-center text-gray-700 hover:text-primary-600 transition-colors duration-200 group">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm group-hover:bg-primary-50 transition-colors duration-200 mr-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </span>
                <span className="font-medium">
                  {course?.title || "Back to Course"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Module Breadcrumb & Progress Indicator */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center bg-white bg-opacity-70 backdrop-blur-sm rounded-full pl-2 pr-4 py-1 shadow-sm mb-4 sm:mb-0">
            <div className="flex h-6 w-6 rounded-full bg-primary-100 items-center justify-center mr-2">
              <svg
                className="h-3.5 w-3.5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <Link
              href={`/learner/courses/${courseId}/modules/${moduleId}`}
              className="text-primary-600 hover:text-primary-800 font-medium text-sm transition-colors">
              {module?.title}
            </Link>
          </div>

          <div className="flex space-x-2">
            {prevLesson && (
              <Link
                href={`/learner/courses/${courseId}/modules/${
                  prevLesson.moduleId || moduleId
                }/lessons/${prevLesson.id}`}
                className="inline-flex items-center px-3 py-1.5 bg-white bg-opacity-70 backdrop-blur-sm text-sm text-gray-700 rounded-full shadow-sm hover:bg-opacity-100 transition-all duration-200">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </Link>
            )}

            {nextLesson && (
              <Link
                href={`/learner/courses/${courseId}/modules/${
                  nextLesson.moduleId || moduleId
                }/lessons/${nextLesson.id}`}
                className="inline-flex items-center px-3 py-1.5 bg-white bg-opacity-70 backdrop-blur-sm text-sm text-gray-700 rounded-full shadow-sm hover:bg-opacity-100 transition-all duration-200">
                Next
                <svg
                  className="h-4 w-4 ml-1"
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
            )}
          </div>
        </div>

        {/* Lesson Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-2xl">
          {/* Lesson Title Bar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-700 opacity-90"></div>
            <div className="relative p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {lesson.title}
              </h1>
              <div className="h-1 w-24 bg-white bg-opacity-30 rounded-full"></div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="p-6 sm:p-8">
            {lesson.content && (
              <div className="prose prose-primary max-w-none lg:prose-lg mb-8 text-black">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}

            {lesson.videoUrl && (
              <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={lesson.videoUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"></iframe>
                </div>
              </div>
            )}

            {/* Attachments Section (Collapsible) */}
            {lesson.attachments &&
              Array.isArray(lesson.attachments) &&
              lesson.attachments.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mt-8">
                  <button
                    onClick={() => setShowAttachments(!showAttachments)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 font-medium text-gray-700">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span>
                        Lesson Resources ({lesson.attachments.length})
                      </span>
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                        showAttachments ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showAttachments && (
                    <div className="px-6 py-4 space-y-3 bg-white border-t border-gray-200">
                      {lesson.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={`/api/lessons/download${attachment.path}`}
                          download={
                            attachment.originalname || attachment.filename
                          }
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                          <div className="flex-shrink-0 h-10 w-10 rounded bg-primary-100 flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors duration-200">
                            <svg
                              className="h-5 w-5 text-primary-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.originalname || attachment.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              Download resource
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Download
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Lesson Completion Action */}
        <div className="flex justify-center mb-8">
          <button
            onClick={markAsCompleted}
            disabled={completingLesson}
            className={`
              relative overflow-hidden px-8 py-4 rounded-full font-bold shadow-lg
              ${
                completingLesson
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white transform transition-all duration-300 hover:scale-105"
              }
            `}>
            {completingLesson && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
            <span className={completingLesson ? "opacity-0" : ""}>
              {nextLesson ? "Complete & Continue" : "Complete & Finish Course"}
            </span>
          </button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {prevLesson && (
            <Link
              href={`/learner/courses/${courseId}/modules/${
                prevLesson.moduleId || moduleId
              }/lessons/${prevLesson.id}`}
              className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow duration-300 border-l-4 border-gray-400">
              <div className="bg-gray-100 rounded-full p-3 mr-4">
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                  Previous Lesson
                </div>
                <div className="font-medium text-gray-900 line-clamp-1">
                  {prevLesson.title}
                </div>
              </div>
            </Link>
          )}

          {nextLesson && (
            <Link
              href={`/learner/courses/${courseId}/modules/${
                nextLesson.moduleId || moduleId
              }/lessons/${nextLesson.id}`}
              className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow duration-300 border-r-4 border-primary-500 ml-auto">
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1 text-right">
                  Next Lesson
                </div>
                <div className="font-medium text-gray-900 line-clamp-1 text-right">
                  {nextLesson.title}
                </div>
              </div>
              <div className="bg-primary-100 rounded-full p-3 ml-4">
                <svg
                  className="h-6 w-6 text-primary-600"
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
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
