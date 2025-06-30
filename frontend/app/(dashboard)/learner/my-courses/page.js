'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../../../lib/axios';
import { motion } from 'framer-motion';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inProgress');
  const [hoverCard, setHoverCard] = useState(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/learner/enrollments');
        setCourses(data.data);
      } catch (err) {
        setError('Failed to load your courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'inProgress') {
      return course.progress < 100;
    } else if (activeTab === 'completed') {
      return course.progress === 100;
    }
    return true;
  });

  // Categorize courses by progress for visual grouping
  const beginnerCourses = filteredCourses.filter(c => c.progress < 30);
  const intermediateCourses = filteredCourses.filter(c => c.progress >= 30 && c.progress < 70);
  const advancedCourses = filteredCourses.filter(c => c.progress >= 70 && c.progress < 100);
  const completedCourses = filteredCourses.filter(c => c.progress === 100);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 rounded-3xl">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
          <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-t-4 border-b-4 border-primary-300 animate-spin animate-delay-150"></div>
          <div className="absolute top-4 left-4 right-4 bottom-4 rounded-full border-t-4 border-b-4 border-primary-100 animate-spin animate-delay-300"></div>
        </div>
        <div className="mt-6 text-primary-700 font-medium text-xl">Loading your learning journey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-xl shadow-lg">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-xl font-bold text-red-800">Unable to load your courses</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all font-medium">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Function to determine progress color based on percentage
  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-emerald-500';
    if (progress >= 70) return 'bg-sky-500';
    if (progress >= 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header with animated background */}
      <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-10 -left-20 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            <span className="block">Your Learning</span>
            <span className="block text-blue-200">Journey</span>
          </h1>
          <p className="mt-4 max-w-xl text-blue-100 text-lg">
            Track your progress, continue where you left off, and explore new courses to expand your knowledge.
          </p>
        </div>
      </div>
      
      {/* Custom tab design */}
      <div className="relative mb-12">
        <div className="flex justify-center sm:justify-start">
          <div className="backdrop-blur-md bg-white/70 p-1.5 rounded-xl shadow-lg overflow-hidden flex">
            {['inProgress', 'completed', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === tab 
                    ? 'text-white shadow-md transform -translate-y-0.5' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                }`}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg -z-10"></div>
                )}
                {tab === 'inProgress' && 'Learning Now'}
                {tab === 'completed' && 'Mastered'}
                {tab === 'all' && 'All Courses'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-12 -mr-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full"></div>
            
            <div className="relative flex flex-col items-center text-center p-6">
              <div className="w-32 h-32 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {activeTab === 'inProgress' 
                  ? "Ready to continue your learning journey?" 
                  : activeTab === 'completed' 
                    ? "Achievement unlocked: Complete your first course!"
                    : "Begin your learning adventure"
                }
              </h3>
              
              <p className="text-lg text-gray-600 mb-8 max-w-md">
                {activeTab === 'inProgress' || activeTab === 'all'
                  ? "Discover courses tailored to your interests and career goals."
                  : "Every expert was once a beginner. Keep going to mark your first completion."
                }
              </p>
              
              <Link
                href="/learner/courses"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 transform"
              >
                <span>Explore Courses</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Timeline visualization of learning journey */}
          <div className="relative pl-8 border-l-2 border-blue-200 ml-4 sm:ml-8 mb-12">
            <div className="absolute top-0 left-0 -ml-3.5 h-7 w-7 rounded-full bg-blue-600 shadow-md border-4 border-white z-10"></div>
            <div className="absolute bottom-0 left-0 -ml-3.5 h-7 w-7 rounded-full bg-blue-600 shadow-md border-4 border-white z-10"></div>
            
            <div className="text-sm uppercase tracking-wider text-blue-700 font-semibold ml-4 mb-2">Your Progress</div>
            <div className="text-3xl font-extrabold text-gray-800 ml-4 mb-6">
              {activeTab === 'completed' ? 'Mastered Skills' : 'Learning Path'}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 ml-6">
              <div className="md:col-span-2">
                <div className="text-lg font-bold text-gray-800 mb-1">
                  Completed: {completedCourses.length} courses
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {filteredCourses.length > 0 ? 
                    `${Math.round((completedCourses.length / filteredCourses.length) * 100)}% of your enrolled courses` : 
                    'No courses enrolled yet'}
                </div>
                
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${filteredCourses.length > 0 ? (completedCourses.length / filteredCourses.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {filteredCourses.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Courses</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course grid with advanced card design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((enrollment, index) => (
              <div 
                key={enrollment.id}
                className="group relative"
                onMouseEnter={() => setHoverCard(enrollment.id)}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${enrollment.progress === 100 ? 'from-emerald-500/20 to-teal-500/20' : 
                    enrollment.progress >= 70 ? 'from-sky-500/20 to-blue-500/20' : 
                    enrollment.progress >= 30 ? 'from-amber-500/20 to-orange-500/20' : 
                    'from-rose-500/20 to-pink-500/20'}
                `}></div>
                
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col">
                  {/* Card top gradient bar */}
                  <div className={`h-2 w-full
                    ${enrollment.progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 
                      enrollment.progress >= 70 ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 
                      enrollment.progress >= 30 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                      'bg-gradient-to-r from-rose-400 to-pink-500'}
                  `}></div>
                  
                  {/* Image section with overlay */}
                  <div className="relative h-48 overflow-hidden">
                    {enrollment.Course && enrollment.Course.thumbnail ? (
                      <img 
                        src={enrollment.Course.thumbnail} 
                        alt={enrollment.Course.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Progress indicator */}
                    <div className="absolute top-4 right-4 flex items-center justify-center rounded-full w-12 h-12 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
                      <div className="relative w-8 h-8">
                        <svg className="w-8 h-8" viewBox="0 0 36 36">
                          <path 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="3"
                            strokeDasharray="100, 100"
                          />
                          <path 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={enrollment.progress === 100 ? '#10B981' : 
                              enrollment.progress >= 70 ? '#0EA5E9' : 
                              enrollment.progress >= 30 ? '#F59E0B' : 
                              '#F43F5E'}
                            strokeWidth="3"
                            strokeDasharray={`${enrollment.progress}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {enrollment.progress}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content section */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                      {enrollment.Course ? enrollment.Course.title : 'Untitled Course'}
                    </h3>
                    
                    <div className="mt-auto pt-4">
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="text-xs">{enrollment.progress === 100 ? 'Completed' : `${enrollment.progress}% Complete`}</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getProgressColor(enrollment.progress)}`}
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <Link
                          href={`/learner/courses/${enrollment.Course ? enrollment.Course.id : enrollment.courseId}`}
                          className={`inline-flex items-center px-4 py-2 rounded-lg ${
                            enrollment.progress === 100 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                              : enrollment.progress >= 70
                                ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                                : enrollment.progress >= 30
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          } font-medium transition-colors duration-200`}
                        >
                          {enrollment.progress === 100 ? 'Review' : 'Continue'}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                        
                        <div className="text-xs text-gray-500">
                          {enrollment.progress === 100 
                            ? `Completed ${new Date(enrollment.completedAt).toLocaleDateString()}` 
                            : enrollment.lastAccessedAt
                              ? `Last active: ${new Date(enrollment.lastAccessedAt).toLocaleDateString()}`
                              : 'Not started yet'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action footer */}
      <div className="mt-16 bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-blue-100 shadow-lg max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Ready to expand your knowledge?</h2>
            <p className="text-gray-600 mt-1">Discover new courses tailored for healthcare professionals.</p>
          </div>
          <Link
            href="/learner/courses"
            className="mt-4 sm:mt-0 inline-flex items-center px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 transform"
          >
            <span>Explore More Courses</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}