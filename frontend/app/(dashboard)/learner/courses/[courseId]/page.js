"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "../../../../../lib/axios";
import PreTestCheck from "../../../../../components/learner/PreTestCheck";
import TestComparison from "../../../../../components/learner/TestComparison";
import { motion } from "framer-motion";
import { BookOpen, Clock, Award, CheckCircle, ChevronRight, Users, BarChart2 } from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setActiveModule(null);

        // Fetch course details
        const coursePromise = axios.get(`/api/courses/${courseId}`);

        // Fetch course modules (to display course outline)
        const modulesPromise = axios.get(`/api/modules/course/${courseId}`);

        // Fetch enrollment status for current user
        const enrollmentPromise = axios.get(
          `/api/learner/enrollments/course/${courseId}`
        );

        // Use Promise.allSettled to handle potential errors gracefully
        const [courseResult, modulesResult, enrollmentResult] =
          await Promise.allSettled([
            coursePromise,
            modulesPromise,
            enrollmentPromise,
          ]);

        // Process course data
        if (courseResult.status === "fulfilled") {
          setCourse(courseResult.value.data.data);
        } else {
          console.error("Failed to fetch course:", courseResult.reason);
          setError("Failed to load course details");
        }

        // Process modules data
        if (modulesResult.status === "fulfilled") {
          const fetchedModules = modulesResult.value.data.data;
          setModules(fetchedModules);
          // --- FIX: Set initial active module after fetching ---
          if (fetchedModules && fetchedModules.length > 0) {
            setActiveModule(fetchedModules[0].id); // Default to the first module's ID
          }
          // ----------------------------------------------------
        } else {
          console.error("Failed to fetch modules:", modulesResult.reason);
        }

        // Process enrollment data
        if (enrollmentResult.status === "fulfilled") {
          setEnrollment(enrollmentResult.value.data.data);
        } else {
          console.error("Failed to fetch enrollment:", enrollmentResult.reason);
          // Don't set an error here as the user might not be enrolled
        }

        try {
          // Fetch access status (for pre/post test) - handle this separately
          // as it might fail due to permissions
          const { data: statusData } = await axios.get(
            `/api/analytics/course/${courseId}/access-status`
          );
          setAccessStatus(statusData);
        } catch (accessErr) {
          console.error("Failed to fetch access status:", accessErr);
          // Don't set main error as this is optional functionality
        }
      } catch (err) {
        setError(
          "Failed to load course: " +
            (err.response?.data?.message || err.message)
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      setEnrollLoading(true);
      await axios.post("/api/enrollments", { courseId });

      // Refresh the page to show enrolled content
      router.refresh();

      // Fetch updated enrollment data (optional, as refresh should handle it)
      // const { data } = await axios.get(`/api/enrollments/${courseId}`);
      // setEnrollment(data.data);
    } catch (err) {
      setError(
        "Failed to enroll in course: " +
          (err.response?.data?.message || err.message)
      );
      console.error(err);
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-primary-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-8 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-gray-500 font-medium text-lg">Loading your learning journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex justify-center items-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-lg max-w-xl w-full">
          <div className="flex items-center">
            <svg className="h-10 w-10 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-bold text-red-800">Something went wrong</h3>
          </div>
          <p className="mt-4 text-red-700">{error}</p>
          <button 
            onClick={() => router.refresh()}
            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[40vh] flex justify-center items-center">
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 max-w-md">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Course Not Found</h3>
          <p className="text-gray-500 mb-6">We couldn't find the course you're looking for.</p>
          <Link href="/learner/courses" className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // Determine whether to use the PreTestCheck wrapper based on access status
  const usePreTestCheck =
    enrollment && accessStatus && accessStatus.preTestRequired;

  // ContentSection component to avoid duplication
  const ContentSection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Course Content</h2>

      <div className="space-y-4">
        {modules.map((module, i) => (
          <div key={module.id} className="border rounded-lg p-4">
            <h3 className="font-medium">
              {i + 1}. {module.title}
            </h3>
            <div className="mt-2 space-y-2">
              {module.Lessons?.map((lesson, j) => (
                <div
                  key={lesson.id}
                  className="pl-4 border-l-2 border-gray-200">
                  {enrollment ? (
                    <Link
                      href={`/learner/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}`}
                      className="text-primary-600 hover:underline">
                      {i + 1}.{j + 1} {lesson.title}
                    </Link>
                  ) : (
                    <span className="text-gray-700">
                      {i + 1}.{j + 1} {lesson.title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // If not enrolled, show course details with enroll button
  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-b-3xl shadow-xl mb-12">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white blur-2xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="md:w-2/3">
                <Link 
                  href="/learner/courses" 
                  className="inline-flex items-center text-white/80 hover:text-white mb-6 group transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Back to Course Catalog</span>
                </Link>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{course.title}</h1>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium inline-flex items-center">
                    <BookOpen size={16} className="mr-1.5" />
                    {course.category === "mental_health" ? "Mental Health" : course.category === "obesity" ? "Obesity" : "Other"}
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium inline-flex items-center">
                    <Award size={16} className="mr-1.5" />
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </span>
                </div>
                
                <p className="text-lg text-white/90 max-w-2xl mb-8 leading-relaxed">
                  {course.description.length > 200 ? `${course.description.substring(0, 200)}...` : course.description}
                </p>
                
                <button
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  className="px-8 py-4 bg-white text-primary-700 hover:bg-white/90 hover:text-primary-800 
                             rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 
                             focus:outline-none focus:ring-4 focus:ring-white/30 disabled:opacity-70
                             transform hover:-translate-y-1 disabled:hover:translate-y-0 inline-flex items-center"
                >
                  {enrollLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-700 mr-3"></div>
                      Enrolling...
                    </>
                  ) : (
                    <>
                      Start Learning Now
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              
              <div className="md:w-1/3 rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-1 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Course Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Details Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="font-bold text-gray-800">About This Course</h2>
                </div>
                <div className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-primary-600 font-medium mb-1">
                        <Clock size={16} className="mr-2" />
                        <span>Duration</span>
                      </div>
                      <p className="text-gray-700">Approx. {modules.reduce((total, module) => total + (module.estimatedTimeInMinutes || 0), 0)} minutes</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-primary-600 font-medium mb-1">
                        <BookOpen size={16} className="mr-2" />
                        <span>Modules</span>
                      </div>
                      <p className="text-gray-700">{modules.length} learning modules</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-primary-600 font-medium mb-1">
                        <Users size={16} className="mr-2" />
                        <span>For</span>
                      </div>
                      <p className="text-gray-700">Healthcare Professionals</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Course Content Preview */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <h2 className="font-bold text-gray-800">Course Content</h2>
                </div>
                
                <div className="p-6 divide-y divide-gray-100">
                  {modules.map((module, i) => (
                    <div key={module.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 text-primary-800 font-bold h-8 w-8 rounded-full flex items-center justify-center mr-3">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{module.title}</h3>
                          {module.Lessons && (
                            <p className="text-sm text-gray-500 mt-1">
                              {module.Lessons.length} {module.Lessons.length === 1 ? 'lesson' : 'lessons'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {module.Lessons && module.Lessons.length > 0 && (
                        <div className="mt-3 ml-11 space-y-2">
                          {module.Lessons.slice(0, 2).map((lesson, j) => (
                            <div key={lesson.id} className="flex items-center text-gray-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-gray-300 mr-2"></div>
                              <span className="text-sm">{lesson.title}</span>
                              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Locked</span>
                            </div>
                          ))}
                          {module.Lessons.length > 2 && (
                            <div className="text-sm text-gray-500 italic">
                              + {module.Lessons.length - 2} more lessons
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - CTA and Info */}
            <div className="space-y-6">
              {/* Enrollment Card */}
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-xl overflow-hidden border border-primary-100 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-200 rounded-full opacity-20 blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="p-6 relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to start learning?</h3>
                  
                  {course.instructor && (
                    <div className="flex items-center mb-6 pb-6 border-b border-primary-100">
                      <div className="h-12 w-12 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold mr-3">
                        {course.instructor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{course.instructor.name}</p>
                        <p className="text-sm text-gray-600">Course Instructor</p>
                      </div>
                    </div>
                  )}
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Full course access</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Track your progress</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Knowledge assessments</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Earn completion certificate</span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={handleEnroll}
                    disabled={enrollLoading}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold
                               shadow-lg hover:shadow-primary-600/30 transition-all duration-300
                               focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-70
                               flex items-center justify-center"
                  >
                    {enrollLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Now - Free"
                    )}
                  </button>
                </div>
              </div>
              
              {/* Knowledge Assessment Card */}
              {course.preTestQuiz && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <div className="flex items-center text-blue-600 mb-4">
                      <BarChart2 size={20} className="mr-2" />
                      <h3 className="font-bold">Knowledge Assessment</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      This course includes pre and post-tests to help you measure your learning progress and knowledge retention.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                      Enroll to unlock assessments and track your progress.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If enrolled, show course content with progress tracking
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30">
      {/* Header Banner with Progress */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mt-24 -mr-24"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -mb-24 -ml-24"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link 
                href="/learner/courses" 
                className="inline-flex items-center text-white/80 hover:text-white mb-2 group transition-all text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>My Courses</span>
              </Link>
              
              <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:min-w-[300px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/90 font-medium">Your Progress</span>
                <span className="font-bold text-white">{enrollment.progress}%</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 relative"
                  style={{ width: `${enrollment.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-300 opacity-80"></div>
                </div>
              </div>
              
              {accessStatus && accessStatus.preTestCompleted && accessStatus.postTestCompleted && (
                <div className="flex justify-between items-center mt-3 text-xs text-white/80">
                  <span>Pre-Test: {accessStatus.preTestScore}%</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>Post-Test: {accessStatus.postTestScore}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Module Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 sticky top-4">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 flex items-center">
                  <BookOpen size={18} className="mr-2 text-primary-600" />
                  Course Content
                </h2>
              </div>
              
              <div className="p-2">
                <div className="space-y-1">
                  {modules.map((module, i) => (
                    <button
                      key={module.id}
                      className={`w-full text-left px-3 py-3 rounded-xl transition-all
                                 flex items-center ${activeModule === module.id 
                                   ? 'bg-primary-50 text-primary-700' 
                                   : 'hover:bg-gray-50 text-gray-700'}`}
                      onClick={() => setActiveModule(module.id)}
                    >
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3
                                     ${activeModule === module.id 
                                       ? 'bg-primary-100 text-primary-700' 
                                       : 'bg-gray-100 text-gray-700'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{module.title}</div>
                        {module.Lessons && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {module.Lessons.length} {module.Lessons.length === 1 ? 'lesson' : 'lessons'}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} className={`ml-2 transform transition-transform
                                                        ${activeModule === module.id ? 'rotate-90 text-primary-600' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Assessment Cards */}
            <div className="mt-6 space-y-4">
              {/* Pre-test button (if not completed) */}
              {accessStatus && accessStatus.preTestId && !accessStatus.preTestCompleted && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center text-blue-700 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-bold">Pre-Test Assessment</h3>
                  </div>
                  <p className="text-blue-700 text-sm mb-4">Take this assessment to measure your current knowledge level before starting the course.</p>
                  <Link
                    href={`/learner/quizzes/${accessStatus.preTestId}`}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                  >
                    Start Pre-Test
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
              
              {/* Post-test button (if pre-test completed but post-test not) */}
              {accessStatus && accessStatus.postTestId && accessStatus.preTestCompleted && !accessStatus.postTestCompleted && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center text-green-700 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-bold">Post-Test Assessment</h3>
                  </div>
                  <p className="text-green-700 text-sm mb-4">After completing the course, take this assessment to measure your progress and knowledge gained.</p>
                  <Link
                    href={`/learner/quizzes/${accessStatus.postTestId}`}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                  >
                    Start Post-Test
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
              
              {/* Test results (if both completed) */}
              {accessStatus && accessStatus.preTestCompleted && accessStatus.postTestCompleted && (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center text-purple-700 mb-3">
                    <BarChart2 size={20} className="mr-2" />
                    <h3 className="font-bold">Your Test Results</h3>
                  </div>
                  <div className="mb-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-800">Pre-Test:</span>
                      <span className="font-medium text-purple-900">{accessStatus.preTestScore}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-800">Post-Test:</span>
                      <span className="font-medium text-purple-900">{accessStatus.postTestScore}%</span>
                    </div>
                    <div className="w-full h-1 bg-purple-200 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${accessStatus.preTestScore}%` }}></div>
                    </div>
                    <div className="w-full h-1 bg-purple-200 rounded-full">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${accessStatus.postTestScore}%` }}></div>
                    </div>
                  </div>
                  <Link
                    href={`/learner/courses/${courseId}/test-results`}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                  >
                    View Detailed Results
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {usePreTestCheck ? (
              <PreTestCheck courseId={courseId}>
                <ModuleContent 
                  modules={modules} 
                  activeModule={activeModule} 
                  courseId={courseId} 
                  enrollment={enrollment} 
                />
              </PreTestCheck>
            ) : (
              <ModuleContent 
                modules={modules} 
                activeModule={activeModule} 
                courseId={courseId} 
                enrollment={enrollment} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Module Content Component
function ModuleContent({ modules, activeModule, courseId, enrollment }) {
  const activeModuleData = modules.find(m => m.id === activeModule) || modules[0];

  if (!activeModuleData) {
    // Handle case where modules might be empty or activeModule is not set yet
    if (modules && modules.length > 0) {
       // If modules exist but activeModule isn't set, maybe default to first one?
       // This case should ideally be handled by the initial state setting in useEffect
       // But as a fallback:
       const firstModule = modules[0];
       return <ModuleDisplay moduleData={firstModule} modules={modules} courseId={courseId} />;
    }
    // If no modules at all
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Module</h3>
        <p className="text-gray-500">Choose a module from the sidebar to view its content.</p>
      </div>
    );
  }

  return <ModuleDisplay moduleData={activeModuleData} modules={modules} courseId={courseId} />;
}


function ModuleDisplay({ moduleData, modules, courseId }) {
  return (
     <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
       <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center">
           <span className="bg-primary-100 text-primary-700 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">
             {modules.findIndex(m => m.id === moduleData.id) + 1}
           </span>
           {moduleData.title}
         </h2>
         
         {/* Add the View Module Details button */}
         <Link
           href={`/learner/courses/${courseId}/modules/${moduleData.id}`}
           className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-all duration-300 flex items-center text-sm font-medium"
         >
           View Module Details
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
         </Link>
       </div>
 
       <div className="p-8">
         {moduleData.description && (
           <p className="text-gray-600 mb-6">{moduleData.description}</p>
         )}

         {!moduleData.Lessons || moduleData.Lessons.length === 0 ? (
           <div className="text-center py-8">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
             </svg>
             <p className="text-gray-500">No lessons available in this module yet.</p>
           </div>
         ) : (
           <>
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-medium text-gray-800">Module Lessons</h3>
               <Link 
                 href={`/learner/courses/${courseId}/modules/${moduleData.id}`}
                 className="text-primary-600 hover:text-primary-800 transition-colors flex items-center text-sm"
               >
                 See all in module
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </Link>
             </div>
             
             <div className="space-y-4">
               {moduleData.Lessons.map((lesson, j) => (
                 <div key={lesson.id} className="group">
                   <Link
                     href={`/learner/courses/${courseId}/modules/${moduleData.id}/lessons/${lesson.id}`}
                     className="block p-4 rounded-xl border border-gray-100 hover:border-primary-200 bg-white hover:bg-primary-50/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                   >
                     {/* Existing lesson content */}
                     <div className="flex items-start">
                       <div className="flex-shrink-0 bg-primary-100 text-primary-700 h-8 w-8 rounded-full flex items-center justify-center font-medium mr-3">
                         {j + 1}
                       </div>
                       <div className="flex-1">
                         <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">{lesson.title}</h3>
                         {lesson.description && (
                           <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lesson.description}</p>
                         )}
                         <div className="flex items-center mt-2 text-sm">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           <span className="text-gray-500">{lesson.estimatedTimeInMinutes || 10} min</span>
                         </div>
                       </div>
                       <div className="self-center ml-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                         </svg>
                       </div>
                     </div>
                   </Link>
                 </div>
               ))}
             </div>
             
             {/* Add a button at the bottom to go to the full module view */}
             <div className="mt-8 flex justify-center">
               <Link
                 href={`/learner/courses/${courseId}/modules/${moduleData.id}`}
                 className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center font-medium"
               >
                 View Full Module
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </Link>
             </div>
           </>
         )}
       </div>
     </div>
   );
}