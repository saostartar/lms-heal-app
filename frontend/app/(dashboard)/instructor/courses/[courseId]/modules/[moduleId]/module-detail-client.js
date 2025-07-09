'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import ModuleForm from '@/components/instructor/ModuleForm';

export default function ModuleDetailClient({ initialModule, initialLessons, initialQuizzes, params }) {
  const { courseId, moduleId } = params;
  const router = useRouter();
  
  const [module, setModule] = useState(initialModule);
  const [lessons, setLessons] = useState(initialLessons);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  
  const [loading, setLoading] = useState(!initialModule); // Loading hanya jika tidak ada data awal
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!initialModule) {
      const fetchModuleData = async () => {
        try {
          setLoading(true);
          
          const { data: moduleData } = await axios.get(`/api/modules/${moduleId}`);
          setModule(moduleData.data);

          const { data: lessonsData } = await axios.get(`/api/lessons/module/${moduleId}`);
          setLessons(lessonsData.data);

          const { data: quizzesData } = await axios.get(`/api/quizzes/module/${moduleId}`);
          setQuizzes(quizzesData.data);
        } catch (err) {
          setError('Failed to load module: ' + (err.response?.data?.message || err.message));
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchModuleData();
    }
  }, [moduleId, initialModule]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/modules/${moduleId}`);
      router.push(`/instructor/courses/${courseId}`);
    } catch (err) {
      alert('Failed to delete module: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 shadow-sm">
        <div className="text-xl font-semibold mb-2">Error</div>
        <div>{error}</div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-gray-600 shadow-sm">
        <div className="text-xl font-semibold">Module not found</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Edit Module</h1>
          <button 
            onClick={() => setIsEditing(false)} 
            className="px-5 py-2.5 border-2 border-gray-300 rounded-lg transition-all hover:border-primary-300 hover:bg-primary-50 text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-2"
          >
            <span>Cancel Editing</span>
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <ModuleForm courseId={courseId} initialData={module} />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary-500/90 to-primary-700 rounded-2xl mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-24 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative p-8">
          <Link 
            href={`/instructor/courses/${courseId}`}
            className="inline-flex items-center text-white/90 hover:text-white mb-2 group transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to course</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-0">{module.title}</h1>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all duration-300 font-medium hover:shadow-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Module
              </button>
              <button 
                onClick={handleDelete} 
                className="px-5 py-2.5 border border-white/30 hover:bg-red-600 text-white rounded-lg transition-all duration-300 font-medium hover:border-red-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {module.description && (
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-100 hover:border-primary-100 transition-all">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-primary-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Description
          </h2>
          <div className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-lg border border-gray-100">
            {module.description}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Lessons Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:border-primary-100 transition-all overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500/90 to-primary-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Lessons
              </h2>
              <Link 
                href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/create`} 
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Lesson
              </Link>
            </div>
          </div>

          <div className="p-6">
            {lessons.length === 0 ? (
              <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No lessons yet. Add your first lesson!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-all hover:shadow-md hover:bg-gradient-to-r hover:from-primary-50/20 hover:to-white"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                          Lesson {index + 1}
                        </span>
                        <h3 className="font-medium text-gray-800 mt-2 mb-1">{lesson.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          lesson.type === 'video' 
                            ? "bg-blue-100 text-blue-700" 
                            : lesson.type === 'quiz' 
                              ? "bg-purple-100 text-purple-700" 
                              : "bg-green-100 text-green-700"
                        }`}>
                          {lesson.type === 'video' ? 'Video' : lesson.type === 'quiz' ? 'Quiz' : 'Text'}
                        </span>
                      </div>
                      <Link
                        href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                        className="text-primary-600 hover:text-primary-800 flex items-center transition-all hover:bg-primary-50 p-2 rounded-lg group"
                      >
                        <span className="mr-1">Edit</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quizzes Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:border-secondary-100 transition-all overflow-hidden">
          <div className="bg-gradient-to-r from-secondary-500/90 to-secondary-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quizzes
              </h2>
              <Link 
                href={`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/create`} 
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Quiz
              </Link>
            </div>
          </div>

          <div className="p-6">
            {quizzes.length === 0 ? (
              <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No quizzes yet. Add a quiz to assess your students!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="border border-gray-200 rounded-xl p-4 hover:border-secondary-300 transition-all hover:shadow-md hover:bg-gradient-to-r hover:from-secondary-50/20 hover:to-white"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">{quiz.title}</h3>
                        <div className="flex gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            quiz.status === 'published' 
                              ? "bg-green-100 text-green-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {quiz.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-xs px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full">
                            Passing: {quiz.passingScore}%
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${quiz.id}`}
                        className="text-secondary-600 hover:text-secondary-800 flex items-center transition-all hover:bg-secondary-50 p-2 rounded-lg group"
                      >
                        <span className="mr-1">Manage</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}