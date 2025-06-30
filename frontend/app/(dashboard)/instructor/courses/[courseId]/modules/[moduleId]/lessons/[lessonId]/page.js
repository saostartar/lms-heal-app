'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '../../../../../../../../../lib/axios';
import LessonForm from '../../../../../../../../../components/instructor/LessonForm';

export default function LessonDetail({ params }) {
  const { courseId, moduleId, lessonId } = params;
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/lessons/${lessonId}`);
        
        // Ensure attachments is always an array
        if (data.data.attachments && !Array.isArray(data.data.attachments)) {
          try {
            // If it's a JSON string, parse it
            if (typeof data.data.attachments === "string") {
              data.data.attachments = JSON.parse(data.data.attachments);
            }
            // If it still isn't an array after parsing, make it an empty array
            if (!Array.isArray(data.data.attachments)) {
              data.data.attachments = [];
            }
          } catch (e) {
            // If parsing fails, set to empty array
            data.data.attachments = [];
          }
        }
        
        setLesson(data.data);
      } catch (err) {
        setError('Failed to load lesson: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/lessons/${lessonId}`);
      router.push(`/instructor/courses/${courseId}/modules/${moduleId}`);
    } catch (err) {
      alert('Failed to delete lesson: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-primary-100 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-8 border-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-primary-600 font-medium">
            <span className="text-xs">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-lg max-w-xl">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-bold text-lg mb-1">Error Loading Lesson</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-lg max-w-xl">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-amber-800 font-bold text-lg mb-1">No Lesson Found</h3>
              <p className="text-amber-700">The requested lesson could not be found or may have been deleted.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">Edit Lesson</h1>
          <button 
            onClick={() => setIsEditing(false)} 
            className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium transition-all hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancel Editing
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <LessonForm courseId={courseId} moduleId={moduleId} initialData={lesson} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header with Background Effect */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary-50 to-primary-100 p-8 overflow-hidden shadow-sm border border-primary-200">
        <div className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 bg-primary-500 opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 -ml-10 -mb-10 bg-primary-600 opacity-10 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <Link 
              href={`/instructor/courses/${courseId}/modules/${moduleId}`} 
              className="inline-flex items-center text-primary-700 hover:text-primary-900 font-medium mb-3 group transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Module
            </Link>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">{lesson.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className={`px-3 py-1.5 rounded-full font-medium text-xs ${
                lesson.type === 'video' ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-50' : 
                lesson.type === 'quiz' ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-50' : 
                'bg-green-100 text-green-800 ring-2 ring-green-50'
              }`}>
                {lesson.type === 'video' ? '📹 Video' : 
                 lesson.type === 'quiz' ? '✓ Quiz' : '📝 Text'}
              </span>
              
              {lesson.duration && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {lesson.duration} minutes
                </span>
              )}
              
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Position {lesson.position}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
            
            <button 
              onClick={handleDelete} 
              className="px-5 py-2.5 rounded-lg bg-white border border-red-200 text-red-600 font-medium transition-all hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Content Section with Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Section */}
          {lesson.type === 'video' && lesson.videoUrl && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gray-800 p-6">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <iframe 
                    src={lesson.videoUrl.replace('watch?v=', 'embed/')} 
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Video Lesson
                </h2>
                
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Source: <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">{lesson.videoUrl}</a></span>
                </div>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Lesson Content
              </h2>
            </div>
            
            <div className="p-6">
              <div className="prose max-w-none bg-gray-50 rounded-xl p-6 border border-gray-100">
                <pre className="whitespace-pre-wrap text-gray-800 font-sans">{lesson.content}</pre>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attachments ({lesson.attachments.length})
                </h2>
                
                <button 
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="inline-flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  aria-expanded={showAttachments}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${showAttachments ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {showAttachments && (
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {lesson.attachments.map((attachment, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                        <div className="p-4 flex">
                          <div className="h-12 w-12 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mr-4 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {attachment.originalname || attachment.filename}
                            </p>
                            
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span className="truncate max-w-[120px]">
                                {attachment.mimetype}
                              </span>
                              <span className="mx-1">•</span>
                              <span>{attachment.size ? Math.round(attachment.size / 1024) + ' KB' : 'Unknown size'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {attachment.path && (
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                            <a 
                              href={attachment.path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:text-primary-800 inline-flex items-center font-medium"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Module Information Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-primary-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Module Information
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Module ID</p>
                    <p className="text-gray-900 font-medium">{lesson.moduleId}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Lesson ID</p>
                    <p className="text-gray-900 font-medium">{lesson.id}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Navigation</h3>
                  
                  <div className="space-y-2">
                    <Link 
                      href={`/instructor/courses/${courseId}/modules/${moduleId}`}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span className="text-gray-700 font-medium">All lessons in module</span>
                    </Link>
                    
                    <Link 
                      href={`/instructor/courses/${courseId}`}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700 font-medium">Course details</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-primary-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center p-3 bg-primary-50 rounded-lg text-primary-700 font-medium hover:bg-primary-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit this lesson
                </button>
                
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center p-3 bg-red-50 rounded-lg text-red-600 font-medium hover:bg-red-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete this lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}