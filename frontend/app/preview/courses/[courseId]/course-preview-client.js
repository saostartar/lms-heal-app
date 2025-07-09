'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ChevronDownIcon, UserIcon, ClockIcon, BookOpenIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

// Terima data awal sebagai props
export default function CoursePreviewClient({ initialCourse, initialModules, initialInstructor, initialError }) {
  // Inisialisasi state dari props
  const [course] = useState(initialCourse);
  const [modules] = useState(initialModules || []);
  const [instructor] = useState(initialInstructor);
  const [loading] = useState(!initialCourse && !initialError);
  const [error] = useState(initialError);
  const [expandedModule, setExpandedModule] = useState(null);

  // useEffect untuk fetching data sudah tidak diperlukan lagi

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-64 flex-grow bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading course details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-bold text-red-700 ml-3">Error Loading Course</h2>
            </div>
            <p className="mt-3 text-red-700">{error}</p>
            <Link href="/courses" className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all">
              Return to Courses
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h3>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed</p>
            <Link href="/courses" className="btn btn-primary">
              Browse Available Courses
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Format category for display
  const formatCategory = (category) => {
    if (category === 'mental_health') return 'Mental Health';
    if (category === 'obesity') return 'Obesity';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Course Image Overlay */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-secondary-600/90 z-10"></div>
        <div className="h-64 md:h-80">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-500"></div>
          )}
        </div>
        
        {/* Course Title Overlay */}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl max-w-3xl">
              <Link href="/courses" className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors mb-4 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to courses
              </Link>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-2">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="badge badge-primary inline-flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
                <span className="badge bg-secondary-100 text-secondary-800 inline-flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-1" />
                  {formatCategory(course.category)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Description Card */}
              <div className="card card-hover mb-8">
                <h2 className="text-2xl font-bold text-primary-700 mb-4">About This Course</h2>
                <div className="prose max-w-none text-gray-700">
                  <p className="leading-relaxed">{course.description}</p>
                </div>
              </div>

              {/* Course Content Preview */}
              <div className="card card-hover mb-8">
                <h2 className="text-2xl font-bold text-primary-700 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Course Content Preview
                </h2>
                
                {modules.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No preview content available yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Check back soon for updates!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-primary-200 hover:shadow-md">
                        <button 
                          onClick={() => toggleModule(module.id)}
                          className="w-full bg-gradient-to-r from-gray-50 to-white px-5 py-4 flex justify-between items-center transition-colors hover:from-primary-50 hover:to-white"
                        >
                          <div className="flex items-center">
                            <div className="bg-primary-100 text-primary-700 h-8 w-8 rounded-full flex items-center justify-center mr-3 font-semibold">
                              {index + 1}
                            </div>
                            <h3 className="font-semibold text-gray-800 text-left">
                              {module.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center">
                            {module.lessons && module.lessons.length > 0 && (
                              <span className="text-sm text-gray-500 mr-3 hidden sm:block">
                                {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                              </span>
                            )}
                            <ChevronDownIcon 
                              className={`h-5 w-5 text-gray-500 transition-transform ${expandedModule === module.id ? 'transform rotate-180' : ''}`}
                            />
                          </div>
                        </button>
                        
                        {expandedModule === module.id && (
                          <div className="px-5 py-4 bg-white border-t border-gray-100 animate-fadeIn">
                            {module.description && (
                              <div className="text-gray-700 mb-4">
                                <p>{module.description}</p>
                              </div>
                            )}
                            
                            {module.lessons && module.lessons.length > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                  <span className="font-medium text-gray-700">Preview Lessons</span>
                                  {module.totalDuration > 0 && (
                                    <span className="flex items-center">
                                      <ClockIcon className="h-4 w-4 mr-1" />
                                      {module.totalDuration} minutes
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-2 mt-2">
                                  {module.lessons.map((lesson, i) => (
                                    <div key={i} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                                      <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">Preview Locked</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Enrollment CTA */}
              <div className="card-glass sticky top-4 border-t-4 border-t-primary-600 mb-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
                  <p className="text-gray-600">Register now to enroll in this course</p>
                </div>
                
                <div className="space-y-3">
                  <Link 
                    href="/register" 
                    className="btn btn-primary w-full text-center justify-center"
                  >
                    Register for Free
                  </Link>
                  <Link
                    href="/login"
                    className="btn btn-outline w-full text-center justify-center"
                  >
                    Log In
                  </Link>
                </div>
              </div>
              
              {/* Instructor Card */}
              {instructor && (
                <div className="card card-hover">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
                    Course Instructor
                  </h3>
                  
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {instructor.profileImage ? (
                        <img 
                          src={instructor.profileImage} 
                          alt={instructor.name} 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        instructor.name.charAt(0)
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{instructor.name}</h4>
                      <p className="text-sm text-primary-700 font-medium">Expert Instructor</p>
                    </div>
                  </div>
                  
                  {instructor.bio && (
                    <div className="mt-3 text-gray-700">
                      <p className="text-sm line-clamp-3">{instructor.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom CTA Section */}
          <div className="mt-12 bg-gradient-to-r from-primary-500/90 to-secondary-500/90 rounded-2xl p-8 shadow-xl text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4 text-white text-shadow">Begin Your Learning Journey Today</h2>
              <p className="text-lg text-white/90 mb-8">
                Unlock your potential with our comprehensive courses and expert-led instruction.
                Create an account to track your progress and connect with other learners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/register" 
                  className="btn bg-white text-primary-700 hover:bg-white/90 hover:text-primary-800 hover:shadow-lg hover:shadow-primary-500/30 transform transition-all duration-300 hover:-translate-y-1"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="btn bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  Sign In to Your Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Add custom keyframes for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}