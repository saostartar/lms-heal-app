"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import {toast} from 'react-hot-toast';

// Terima semua data awal sebagai props
export default function LessonDetailClient({
  params,
}) {
  const router = useRouter();
  const { courseId, moduleId, lessonId } = params;

  // Inisialisasi state dari props
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
  const [readingProgress, setReadingProgress] = useState(0);

  // Helper function to convert YouTube watch URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Regular expression to match YouTube video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    return url; // Return original if not a youtube link (or already embed)
  };

  // Client-side fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching lesson data...");

        const [lessonRes, courseRes, moduleRes, progressRes, moduleLessonsRes, courseModulesRes] = await Promise.allSettled([
          axios.get(`/api/lessons/${lessonId}`),
          axios.get(`/api/courses/${courseId}`),
          axios.get(`/api/modules/${moduleId}`),
          axios.get(`/api/progress/course/${courseId}`),
          axios.get(`/api/lessons/module/${moduleId}`),
          axios.get(`/api/modules/course/${courseId}`),
        ]);

        const getData = (res) => (res.status === 'fulfilled' ? res.value.data.data : null);
        const getError = (res) => (res.status === 'rejected' ? (res.reason.response?.data?.message || res.reason.message) : null);

        const lessonData = getData(lessonRes);
        const courseData = getData(courseRes);
        const moduleData = getData(moduleRes);
        const progressData = getData(progressRes);
        const moduleLessonsData = getData(moduleLessonsRes) || [];
        const courseModulesData = getData(courseModulesRes) || [];

        if (!lessonData) {
            throw new Error(getError(lessonRes) || "Failed to load lesson.");
        }

        // Logic for prev/next lesson
        let prev = null;
        let next = null;
        const currentLessonIndex = moduleLessonsData.findIndex(l => l.id === parseInt(lessonId));

        // Cari lesson sebelumnya
        if (currentLessonIndex > 0) {
            prev = moduleLessonsData[currentLessonIndex - 1];
        } else {
            const currentModuleIndex = courseModulesData.findIndex(m => m.id === parseInt(moduleId));
            if (currentModuleIndex > 0) {
                const prevModule = courseModulesData[currentModuleIndex - 1];
                try {
                    const { data: prevModuleLessonsData } = await axios.get(`/api/lessons/module/${prevModule.id}`);
                    if (prevModuleLessonsData.data.length > 0) {
                        prev = {
                            ...prevModuleLessonsData.data[prevModuleLessonsData.data.length - 1],
                            moduleId: prevModule.id,
                        };
                    }
                } catch (e) {
                    console.error("Error fetching previous module lessons", e);
                }
            }
        }

        // Cari lesson berikutnya
        if (currentLessonIndex < moduleLessonsData.length - 1) {
            next = moduleLessonsData[currentLessonIndex + 1];
        } else {
            const currentModuleIndex = courseModulesData.findIndex(m => m.id === parseInt(moduleId));
            if (currentModuleIndex < courseModulesData.length - 1) {
                const nextModule = courseModulesData[currentModuleIndex + 1];
                try {
                    const { data: nextModuleLessonsData } = await axios.get(`/api/lessons/module/${nextModule.id}`);
                    if (nextModuleLessonsData.data.length > 0) {
                        next = {
                            ...nextModuleLessonsData.data[0],
                            moduleId: nextModule.id,
                        };
                    }
                } catch (e) {
                    console.error("Error fetching next module lessons", e);
                }
            }
        }

        if (lessonData.attachments && !Array.isArray(lessonData.attachments)) {
            try {
                lessonData.attachments = typeof lessonData.attachments === 'string' ? JSON.parse(lessonData.attachments) : [];
                if (!Array.isArray(lessonData.attachments)) lessonData.attachments = [];
            } catch (e) {
                lessonData.attachments = [];
            }
        }

        setLesson(lessonData);
        setCourse(courseData);
        setModule(moduleData);
        setProgress(progressData);
        setNextLesson(next);
        setPrevLesson(prev);

      } catch (err) {
        console.error("Error fetching lesson data:", err);
        setError(err.response?.data?.message || err.message || "Failed to load lesson data.");
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && courseId && moduleId) {
      fetchData();
    }
  }, [lessonId, courseId, moduleId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const markAsCompleted = async () => {
    try {
      setCompletingLesson(true);
      
      await axios.put(`/api/progress/lesson/${lesson.id}`, {
        status: "completed",
      });

      toast.success("Lesson completed successfully!");
      
      setTimeout(() => {
        if (nextLesson) {
          router.push(`/learner/courses/${courseId}/modules/${nextLesson.moduleId || moduleId}/lessons/${nextLesson.id}`);
        } else {
          router.push(`/learner/courses/${courseId}?completed=true`);
        }
      }, 1500);

    } catch (error) {
      console.error("Error completing lesson:", error);
      toast.error("Failed to mark lesson as completed");
    } finally {
      setCompletingLesson(false);
    }
  };

  const renderHTMLContent = (content) => {
    if (!content) return '';
    return (
      <div 
        className="lesson-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-blue-600 font-medium">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
          <div className="bg-gradient-to-r from-red-500 to-red-600 h-2"></div>
          <div className="p-8 text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={`/learner/courses/${courseId}`}
              className="inline-block w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full text-center p-8">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Lesson Not Found</h3>
          <p className="text-gray-600 mb-6">We couldn't find the lesson you're looking for.</p>
          <Link
            href={`/learner/courses/${courseId}/modules/${moduleId}`}
            className="inline-block py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
            Back to Module
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Header Navigation */}
      <div className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/learner/courses/${courseId}`}
                className="group flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200 mr-3">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="font-medium truncate max-w-xs">
                  {course?.title || "Back to Course"}
                </span>
              </Link>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              {prevLesson && (
                <Link
                  href={`/learner/courses/${courseId}/modules/${prevLesson.moduleId || moduleId}/lessons/${prevLesson.id}`}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </Link>
              )}

              {nextLesson && (
                <Link
                  href={`/learner/courses/${courseId}/modules/${nextLesson.moduleId || moduleId}/lessons/${nextLesson.id}`}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                  <span className="hidden sm:inline">Next</span>
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Breadcrumb */}
        <div className="mb-8">
          <div className="items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-200/50 inline-flex">
            <div className="flex h-6 w-6 rounded-full bg-blue-100 items-center justify-center mr-3">
              <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <Link
              href={`/learner/courses/${courseId}/modules/${moduleId}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
              {module?.title}
            </Link>
          </div>
        </div>

        {/* Lesson Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative p-8 sm:p-12">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Lesson Content</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 leading-tight">
                {lesson.title}
              </h1>
              <div className="h-1 w-20 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-8 sm:p-12">
            {/* Video Section */}
            {lesson.videoUrl && (
              <div className="mb-12">
                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                  <div className="aspect-video">
                    <iframe
                      src={getEmbedUrl(lesson.videoUrl)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ minHeight: '400px' }}
                    ></iframe>
                  </div>
                </div>
              </div>
            )}

            {/* Text Content with Rich Text Support */}
            {lesson.content && (
              <div className="mb-12">
                <style jsx global>{`
                  .lesson-content {
                    font-size: 1.125rem;
                    line-height: 1.75;
                    color: #374151;
                  }
                  .lesson-content h1 { 
                    font-size: 2.25rem; 
                    font-weight: bold; 
                    margin-bottom: 1.5rem;
                    margin-top: 2rem;
                    color: #1f2937;
                    line-height: 1.2;
                  }
                  .lesson-content h2 { 
                    font-size: 2rem; 
                    font-weight: bold; 
                    margin-bottom: 1.25rem;
                    margin-top: 1.75rem;
                    color: #1f2937;
                    line-height: 1.3;
                  }
                  .lesson-content h3 { 
                    font-size: 1.75rem; 
                    font-weight: bold; 
                    margin-bottom: 1rem;
                    margin-top: 1.5rem;
                    color: #1f2937;
                    line-height: 1.4;
                  }
                  .lesson-content h4 { 
                    font-size: 1.5rem; 
                    font-weight: bold; 
                    margin-bottom: 0.875rem;
                    margin-top: 1.25rem;
                    color: #374151;
                    line-height: 1.4;
                  }
                  .lesson-content h5 { 
                    font-size: 1.25rem; 
                    font-weight: bold; 
                    margin-bottom: 0.75rem;
                    margin-top: 1rem;
                    color: #374151;
                    line-height: 1.5;
                  }
                  .lesson-content h6 { 
                    font-size: 1.125rem; 
                    font-weight: bold; 
                    margin-bottom: 0.5rem;
                    margin-top: 0.875rem;
                    color: #4b5563;
                    line-height: 1.5;
                  }
                  .lesson-content p { 
                    margin-bottom: 1.25rem; 
                    line-height: 1.75; 
                    color: #374151; 
                    font-size: 1.125rem;
                  }
                  .lesson-content ul, .lesson-content ol { 
                    margin-bottom: 1.25rem; 
                    padding-left: 2rem; 
                    color: #374151; 
                  }
                  .lesson-content li { 
                    margin-bottom: 0.5rem; 
                    line-height: 1.6; 
                  }
                  .lesson-content blockquote { 
                    border-left: 4px solid #e5e7eb; 
                    margin: 1.5rem 0; 
                    padding-left: 1rem; 
                    font-style: italic;
                    color: #6b7280;
                  }
                  .lesson-content code { 
                    background-color: #f3f4f6; 
                    color: #1f2937; 
                    padding: 0.25rem 0.5rem; 
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                  }
                  .lesson-content pre { 
                    background-color: #1f2937; 
                    color: #f9fafb; 
                    padding: 1rem; 
                    border-radius: 0.5rem; 
                    overflow-x: auto; 
                    margin: 1.5rem 0; 
                  }
                  .lesson-content pre code {
                    background-color: transparent;
                    color: inherit;
                    padding: 0;
                  }
                  .lesson-content img { 
                    max-width: 100%; 
                    height: auto; 
                    border-radius: 0.5rem; 
                    margin: 1.5rem 0; 
                  }
                  .lesson-content a { 
                    color: #3b82f6; 
                    text-decoration: underline; 
                  }
                  .lesson-content a:hover { 
                    color: #1d4ed8; 
                  }
                  .lesson-content strong, .lesson-content b {
                    font-weight: 700;
                    color: #1f2937;
                  }
                  .lesson-content em, .lesson-content i {
                    font-style: italic;
                    color: #374151;
                  }
                  .lesson-content u {
                    text-decoration: underline;
                    color: #374151;
                  }
                  .lesson-content s {
                    text-decoration: line-through;
                    color: #374151;
                  }
                  .lesson-content sup {
                    vertical-align: super;
                    font-size: smaller;
                  }
                  .lesson-content sub {
                    vertical-align: sub;
                    font-size: smaller;
                  }
                  .lesson-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                  }
                  .lesson-content th, .lesson-content td {
                    border: 1px solid #d1d5db;
                    padding: 0.75rem;
                    text-align: left;
                  }
                  .lesson-content th {
                    background-color: #f9fafb;
                    font-weight: 600;
                  }
                  .lesson-content .ql-align-center {
                    text-align: center;
                  }
                  .lesson-content .ql-align-right {
                    text-align: right;
                  }
                  .lesson-content .ql-align-justify {
                    text-align: justify;
                  }
                `}</style>
                {renderHTMLContent(lesson.content)}
              </div>
            )}

            {/* Attachments Section */}
            {lesson.attachments && Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 overflow-hidden">
                  <button
                    onClick={() => setShowAttachments(!showAttachments)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-blue-100/50 transition-colors duration-200">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-lg p-2 mr-3">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Lesson Resources</h3>
                        <p className="text-sm text-gray-600">{lesson.attachments.length} files available</p>
                      </div>
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${showAttachments ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showAttachments && (
                    <div className="px-6 pb-6 space-y-3">
                      {lesson.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={`/api/lessons/download${attachment.path}`}
                          download={attachment.originalname || attachment.filename}
                          className="group flex items-center p-4 bg-white rounded-xl hover:bg-blue-50 transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-md">
                          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mr-4 transition-colors duration-200">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                              {attachment.originalname || attachment.filename}
                            </p>
                            <p className="text-xs text-gray-500">Click to download</p>
                          </div>
                          <div className="ml-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 group-hover:bg-green-200 transition-colors">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion Button */}
        <div className="text-center mb-12">
          <button
            onClick={markAsCompleted}
            disabled={completingLesson}
            className={`
              relative inline-flex items-center px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-300
              ${completingLesson 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transform hover:scale-105 hover:shadow-2xl"
              }
            `}>
            {completingLesson && (
              <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>
              {completingLesson 
                ? "Completing lesson..." 
                : nextLesson 
                ? "Complete & Continue" 
                : "Complete & Finish Course"
              }
            </span>
            {!completingLesson && (
              <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prevLesson && (
            <Link
              href={`/learner/courses/${courseId}/modules/${prevLesson.moduleId || moduleId}/lessons/${prevLesson.id}`}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl p-6 border-l-4 border-gray-400 hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-gray-100 group-hover:bg-blue-100 rounded-full p-3 mr-4 transition-colors duration-300">
                  <svg className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Previous Lesson
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">
                    {prevLesson.title}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {nextLesson && (
            <Link
              href={`/learner/courses/${courseId}/modules/${nextLesson.moduleId || moduleId}/lessons/${nextLesson.id}`}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl p-6 border-r-4 border-blue-500 hover:border-indigo-500 transition-all duration-300 md:ml-auto">
              <div className="flex items-center">
                <div className="flex-1 text-right">
                  <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Next Lesson
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">
                    {nextLesson.title}
                  </div>
                </div>
                <div className="bg-blue-100 group-hover:bg-indigo-100 rounded-full p-3 ml-4 transition-colors duration-300">
                  <svg className="h-6 w-6 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}