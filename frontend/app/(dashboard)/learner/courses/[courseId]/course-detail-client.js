"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Clock, Award, CheckCircle, ChevronRight, Users, 
  BarChart2, PlayCircle, FileText, Star, Calendar, Target, 
  TrendingUp, Zap, BookmarkCheck, ArrowLeft, Loader2
} from 'lucide-react';

export default function CourseDetailClient({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId;
  
  // State inisialisasi kosong
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeModule, setActiveModule] = useState(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // --- FETCH DATA DI SINI (CLIENT SIDE) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching course data...");

        // 1. Ambil data Course, Module, Enrollment, & Access Status secara paralel
        const [courseRes, modulesRes, enrollmentRes, accessStatusRes] = await Promise.allSettled([
          axios.get(`/api/courses/${courseId}`),
          axios.get(`/api/modules/course/${courseId}`),
          axios.get(`/api/learner/enrollments/course/${courseId}`),
          axios.get(`/api/analytics/course/${courseId}/access-status`)
        ]);

        // Helper untuk ambil data dari Promise.allSettled
        const getData = (res) => (res.status === 'fulfilled' ? res.value.data.data : null);

        const courseData = getData(courseRes);
        const modulesData = getData(modulesRes) || [];
        const enrollmentData = getData(enrollmentRes);
        const accessStatusData = getData(accessStatusRes);

        if (!courseData) {
          throw new Error("Failed to load course details.");
        }

        setCourse(courseData);
        setModules(modulesData);
        setEnrollment(enrollmentData);
        setAccessStatus(accessStatusData);
        
        // Set module aktif pertama jika ada
        if (modulesData.length > 0) {
          setActiveModule(modulesData[0].id);
        }

        // 2. Jika user sudah enroll, ambil data Progress
        if (enrollmentData) {
          try {
            const progressRes = await axios.get(`/api/progress/course/${courseId}`);
            setProgressData(progressRes.data.data);
          } catch (progErr) {
            console.error("Failed to load progress:", progErr);
          }
        }

      } catch (err) {
        console.error("Error fetching course data:", err);
        setError(err.response?.data?.message || err.message || "Failed to load course data.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  // Check for completion message from URL params (tetap di client)
  useEffect(() => {
    if (searchParams.get('completed') === 'true') {
      setShowCompletionMessage(true);
      setTimeout(() => setShowCompletionMessage(false), 5000);
    }
  }, [searchParams]);

  // Fungsi refresh progress tetap di client
  const refreshProgress = async () => {
    try {
      const { data: progressResult } = await axios.get(`/api/progress/course/${courseId}`);
      setProgressData(progressResult.data);
      setEnrollment(prev => ({
        ...prev,
        progress: progressResult.data.enrollment.progress,
        isCompleted: progressResult.data.enrollment.isCompleted
      }));
    } catch (error) {
      console.error("Failed to refresh progress:", error);
    }
  };

  const currentProgress = progressData?.overallProgress || enrollment?.progress || 0;

  // Fungsi enroll tetap di client
  const handleEnroll = async () => {
    try {
      setEnrollLoading(true);
      setError(null);
      await axios.post("/api/enrollments", { courseId });
      const { data } = await axios.get(`/api/learner/enrollments/course/${courseId}`);
      setEnrollment(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to enroll in course");
    } finally {
      setEnrollLoading(false);
    }
  };

  // Helper function to format lesson duration
  const formatDuration = (duration) => {
    if (!duration || duration === 0) {
      return "5 min"; // Default duration if not specified
    }
    
    if (duration < 60) {
      return `${duration} min`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  // Helper function to calculate total course duration
  const getTotalDuration = () => {
    let total = 0;
    modules.forEach(module => {
      if (module.Lessons) {
        module.Lessons.forEach(lesson => {
          total += lesson.duration || lesson.estimatedTimeInMinutes || 5; // Default 5 min if no duration
        });
      }
    });
    return formatDuration(total);
  };

  // Helper function to count total lessons
  const getTotalLessons = () => {
    return modules.reduce((total, module) => {
      return total + (module.Lessons ? module.Lessons.length : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center items-center">
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-8 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Learning Journey</h3>
          <p className="text-gray-600">Preparing your personalized course experience...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex justify-center items-center p-6">
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => router.refresh()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center font-medium"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <Link 
                href="/learner/courses"
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 flex items-center justify-center font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex justify-center items-center p-6">
        <motion.div 
          className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Course Not Found</h3>
          <p className="text-gray-600 mb-8">We couldn't find the course you're looking for. It may have been moved or deleted.</p>
          <Link 
            href="/learner/courses" 
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Courses
          </Link>
        </motion.div>
      </div>
    );
  }

  // If not enrolled, show course details with enroll button
  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 text-white">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-secondary-300 blur-3xl"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full bg-indigo-300 blur-3xl transform -translate-x-1/2"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="flex flex-col md:flex-row md:items-center gap-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="md:w-2/3">
                <Link 
                  href="/learner/courses" 
                  className="inline-flex items-center text-white/80 hover:text-white mb-8 group transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-medium">Back to Course Catalog</span>
                </Link>
                
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-black"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  {course.title}
                </motion.h1>
                
                <motion.div 
                  className="flex flex-wrap gap-3 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium inline-flex items-center border border-white/10">
                    <BookOpen size={16} className="mr-2" />
                    {course.category === "mental_health" ? "Mental Health" : 
                     course.category === "obesity" ? "Obesity Management" : 
                     course.category === "nutrition" ? "Nutrition & Wellness" : "Health Education"}
                  </span>
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium inline-flex items-center border border-white/10">
                    <Award size={16} className="mr-2" />
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)} Level
                  </span>
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium inline-flex items-center border border-white/10">
                    <Clock size={16} className="mr-2" />
                    {getTotalDuration()}
                  </span>
                </motion.div>
                
                <motion.p 
                  className="text-xl text-white/90 max-w-2xl mb-10 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  {course.description.length > 200 ? `${course.description.substring(0, 200)}...` : course.description}
                </motion.p>
                
                <motion.button
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  className="group px-8 py-4 bg-white text-primary-700 hover:bg-white/95 hover:text-primary-800 
                             rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 
                             focus:outline-none focus:ring-4 focus:ring-white/30 disabled:opacity-70
                             transform hover:-translate-y-1 disabled:hover:translate-y-0 inline-flex items-center text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {enrollLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-3 group-hover:text-yellow-500 transition-colors" />
                      Start Learning Now
                      <ChevronRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
              
              <motion.div 
                className="md:w-1/3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-2 shadow-2xl">
                  <div className="aspect-video bg-gradient-to-br from-primary-500 via-secondary-500 to-indigo-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <PlayCircle className="h-24 w-24 text-white/80 relative z-10" />
                    <div className="absolute bottom-4 left-4 text-white/90 font-medium text-sm">Course Preview</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Course Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Details Card */}
              <motion.div 
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="border-b border-gray-100 px-8 py-6 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="bg-primary-100 rounded-xl p-2 mr-3">
                      <Target className="h-6 w-6 text-primary-600" />
                    </div>
                    About This Course
                  </h2>
                </div>
                <div className="p-8">
                  <div className="prose max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed text-lg">{course.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-center text-blue-700 font-semibold mb-2">
                        <Clock size={20} className="mr-3" />
                        <span>Duration</span>
                      </div>
                      <p className="text-blue-900 font-medium">{getTotalDuration()}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                      <div className="flex items-center text-green-700 font-semibold mb-2">
                        <BookOpen size={20} className="mr-3" />
                        <span>Content</span>
                      </div>
                      <p className="text-green-900 font-medium">{modules.length} modules, {getTotalLessons()} lessons</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                      <div className="flex items-center text-purple-700 font-semibold mb-2">
                        <Users size={20} className="mr-3" />
                        <span>Audience</span>
                      </div>
                      <p className="text-purple-900 font-medium">Healthcare Professionals</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Course Content Preview */}
              <motion.div 
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="border-b border-gray-100 px-8 py-6 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="bg-primary-100 rounded-xl p-2 mr-3">
                      <BookmarkCheck className="h-6 w-6 text-primary-600" />
                    </div>
                    Course Content
                  </h2>
                </div>
                
                <div className="p-8">
                  <div className="space-y-6">
                    {modules.map((module, i) => (
                      <motion.div 
                        key={module.id} 
                        className="border border-gray-200 rounded-2xl p-6 hover:border-primary-200 hover:shadow-md transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i, duration: 0.5 }}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold h-12 w-12 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                            {module.Lessons && (
                              <div className="flex items-center text-gray-500 mb-4">
                                <FileText size={16} className="mr-2" />
                                <span className="text-sm">
                                  {module.Lessons.length} {module.Lessons.length === 1 ? 'lesson' : 'lessons'}
                                </span>
                                <span className="mx-2">•</span>
                                <Clock size={16} className="mr-2" />
                                <span className="text-sm">
                                  {formatDuration(module.Lessons.reduce((total, lesson) => 
                                    total + (lesson.duration || lesson.estimatedTimeInMinutes || 5), 0))}
                                </span>
                              </div>
                            )}
                            
                            {module.Lessons && module.Lessons.length > 0 && (
                              <div className="space-y-3">
                                {module.Lessons.slice(0, 3).map((lesson, j) => (
                                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center">
                                      <div className="h-2 w-2 rounded-full bg-gray-300 mr-3"></div>
                                      <span className="text-gray-700 font-medium">{lesson.title}</span>
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                      <Clock size={14} className="mr-1" />
                                      <span className="text-sm">{formatDuration(lesson.duration || lesson.estimatedTimeInMinutes)}</span>
                                      <span className="ml-3 text-xs bg-gray-200 px-2 py-1 rounded-full">Locked</span>
                                    </div>
                                  </div>
                                ))}
                                {module.Lessons.length > 3 && (
                                  <div className="text-center py-2">
                                    <span className="text-gray-500 text-sm italic">
                                      + {module.Lessons.length - 3} more lessons
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right Column - CTA and Info */}
            <div className="space-y-8">
              {/* Enrollment Card */}
              <motion.div 
                className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-3xl shadow-xl overflow-hidden border border-primary-100 relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 rounded-full opacity-20 blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="p-8 relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Transform Your Knowledge?</h3>
                  
                  {course.instructor && (
                    <div className="flex items-center mb-8 pb-6 border-b border-primary-100">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                        {course.instructor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-lg">{course.instructor.name}</p>
                        <p className="text-gray-600">Course Instructor</p>
                      </div>
                    </div>
                  )}
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      { icon: CheckCircle, text: "Full lifetime course access" },
                      { icon: TrendingUp, text: "Track your learning progress" },
                      { icon: BarChart2, text: "Knowledge assessments & quizzes" },
                      { icon: Award, text: "Earn completion certificate" }
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                      >
                        <item.icon size={20} className="text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-medium">{item.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <motion.button
                    onClick={handleEnroll}
                    disabled={enrollLoading}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl font-bold text-lg
                               shadow-lg hover:shadow-primary-600/30 transition-all duration-300
                               focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-70
                               flex items-center justify-center transform hover:-translate-y-1 disabled:hover:translate-y-0"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {enrollLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-3" />
                        Enroll Now - Free
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Knowledge Assessment Card */}
              {course.preTestQuiz && (
                <motion.div 
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <div className="p-8">
                    <div className="flex items-center text-blue-600 mb-4">
                      <div className="bg-blue-100 rounded-xl p-2 mr-3">
                        <BarChart2 size={20} />
                      </div>
                      <h3 className="text-xl font-bold">Knowledge Assessment</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      This course includes comprehensive pre and post assessments to help you measure your learning progress and knowledge retention effectively.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                      <div className="flex items-center text-blue-700">
                        <Star className="h-5 w-5 mr-2" />
                        <span className="font-medium">Enroll to unlock assessments and track your progress</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If enrolled, show course content with progress tracking
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Completion Message */}
      <AnimatePresence>
        {showCompletionMessage && (
          <motion.div
            className="fixed top-4 right-4 z-50 max-w-md"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-green-500 text-white p-4 rounded-2xl shadow-xl border border-green-400">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 mr-3" />
                <div>
                  <h4 className="font-bold">Congratulations!</h4>
                  <p className="text-sm text-green-100">You've completed the lesson successfully!</p>
                </div>
                <motion.button
                  className="ml-4 text-green-200 hover:text-white"
                  onClick={() => setShowCompletionMessage(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner with Progress */}
      <motion.div 
        className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 text-white shadow-2xl mb-8 relative overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mt-48 -mr-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-300 rounded-full blur-3xl -mb-48 -ml-48"></div>
        </div>
        
         <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <Link 
                href="/learner/courses" 
                className="inline-flex items-center text-white/80 hover:text-white mb-4 group transition-all text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                <span>My Learning Journey</span>
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-black">{course.title}</h1>
              <p className="text-white/80 text-lg">Continue your learning progress</p>
            </div>
            
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:min-w-[350px] border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/90 font-semibold">Overall Progress</span>
                <span className="font-bold text-white text-xl">{Math.round(currentProgress)}%</span>
              </div>
              <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-4">
                <motion.div 
                  className="h-full bg-gradient-to-r from-secondary-400 to-yellow-400 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                  key={currentProgress} // Add key to force re-animation on progress change
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-white font-bold text-lg">{modules.length}</div>
                  <div className="text-white/70 text-xs">Modules</div>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{getTotalLessons()}</div>
                  <div className="text-white/70 text-xs">Lessons</div>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{getTotalDuration()}</div>
                  <div className="text-white/70 text-xs">Duration</div>
                </div>
              </div>
              
              {/* Show completion status */}
              {progressData?.isCompleted && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-center text-green-300">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Course Completed!</span>
                  </div>
                </div>
              )}
              
              {accessStatus && accessStatus.preTestCompleted && accessStatus.postTestCompleted && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20 text-sm text-white/80">
                  <div className="flex items-center">
                    <BarChart2 size={14} className="mr-1" />
                    <span>Pre: {accessStatus.preTestScore}%</span>
                  </div>
                  <ChevronRight size={16} />
                  <div className="flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    <span>Post: {accessStatus.postTestScore}%</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar - Module Navigation */}
          <div className="xl:col-span-1">
            <motion.div 
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="bg-primary-100 rounded-xl p-2 mr-3">
                    <BookOpen size={20} className="text-primary-600" />
                  </div>
                  Course Modules
                </h2>
              </div>
              
              <div className="p-3">
                <div className="space-y-2">
                  {modules.map((module, i) => (
                    <motion.button
                      key={module.id}
                      className={`w-full text-left px-4 py-4 rounded-2xl transition-all duration-300
                                 flex items-center group ${activeModule === module.id 
                                   ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                                   : 'hover:bg-gray-50 text-gray-700 hover:shadow-md'}`}
                      onClick={() => setActiveModule(module.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mr-3 font-bold
                                     ${activeModule === module.id 
                                       ? 'bg-white/20 text-white' 
                                       : 'bg-gray-100 text-gray-700 group-hover:bg-primary-100 group-hover:text-primary-700'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{module.title}</div>
                        {module.Lessons && (
                          <div className={`text-sm mt-1 ${activeModule === module.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {module.Lessons.length} {module.Lessons.length === 1 ? 'lesson' : 'lessons'} • {formatDuration(module.Lessons.reduce((total, lesson) => total + (lesson.duration || lesson.estimatedTimeInMinutes || 5), 0))}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={18} className={`ml-2 transform transition-transform
                                                        ${activeModule === module.id ? 'rotate-90 text-white' : 'group-hover:translate-x-1'}`} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Assessment Cards */}
            <div className="mt-8 space-y-6">
              {/* Pre-test button */}
              {accessStatus && accessStatus.preTestId && !accessStatus.preTestCompleted && (
                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-center text-blue-700 mb-4">
                    <div className="bg-blue-200 rounded-xl p-2 mr-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg">Pre-Test Assessment</h3>
                  </div>
                  <p className="text-blue-700 mb-6 leading-relaxed">Measure your current knowledge level before starting the course journey.</p>
                  <Link
                    href={`/learner/quizzes/${accessStatus.preTestId}`}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Pre-Test
                  </Link>
                </motion.div>
              )}
              
              {/* Post-test button */}
              {accessStatus && accessStatus.postTestId && accessStatus.preTestCompleted && !accessStatus.postTestCompleted && (
                <motion.div 
                  className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-3xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <div className="flex items-center text-green-700 mb-4">
                    <div className="bg-green-200 rounded-xl p-2 mr-3">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg">Post-Test Assessment</h3>
                  </div>
                  <p className="text-green-700 mb-6 leading-relaxed">Evaluate your progress and measure the knowledge you've gained.</p>
                  <Link
                    href={`/learner/quizzes/${accessStatus.postTestId}`}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    <Award className="h-5 w-5 mr-2" />
                    Start Post-Test
                  </Link>
                </motion.div>
              )}
              
              {/* Test results */}
              {accessStatus && accessStatus.preTestCompleted && accessStatus.postTestCompleted && (
                <motion.div 
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-3xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="flex items-center text-purple-700 mb-4">
                    <div className="bg-purple-200 rounded-xl p-2 mr-3">
                      <BarChart2 size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Assessment Results</h3>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-purple-800 font-medium">Pre-Test Score:</span>
                      <span className="font-bold text-purple-900">{accessStatus.preTestScore}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-purple-800 font-medium">Post-Test Score:</span>
                      <span className="font-bold text-purple-900">{accessStatus.postTestScore}%</span>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl">
                      <div className="flex justify-between text-sm text-purple-700 mb-2">
                        <span>Improvement</span>
                        <span className="font-medium">+{accessStatus.postTestScore - accessStatus.preTestScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0, accessStatus.postTestScore - accessStatus.preTestScore) * 2}%` }}
                          transition={{ delay: 1, duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/learner/courses/${courseId}/test-results`}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    View Detailed Results
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="xl:col-span-3">
            <ModuleContent 
              modules={modules} 
              activeModule={activeModule} 
              courseId={courseId} 
              enrollment={enrollment}
              progressData={progressData}
              refreshProgress={refreshProgress}
              formatDuration={formatDuration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Module Content Component
function ModuleContent({ modules, activeModule, courseId, enrollment, progressData, refreshProgress, formatDuration }) {
  const activeModuleData = modules.find(m => m.id === activeModule) || modules[0];

  if (!activeModuleData) {
    if (modules && modules.length > 0) {
       const firstModule = modules[0];
       return <ModuleDisplay moduleData={firstModule} modules={modules} courseId={courseId} progressData={progressData} formatDuration={formatDuration} />;
    }
    
    return (
      <motion.div 
        className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gray-100 rounded-3xl p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">Select a Module</h3>
        <p className="text-gray-500 text-lg">Choose a module from the sidebar to explore its content and lessons.</p>
      </motion.div>
    );
  }

  return <ModuleDisplay moduleData={activeModuleData} modules={modules} courseId={courseId} progressData={progressData} formatDuration={formatDuration} />;
}

// Enhanced Module Display Component
function ModuleDisplay({ moduleData, modules, courseId, progressData, formatDuration }) {
  const moduleIndex = modules.findIndex(m => m.id === moduleData.id);
  
  // Get module progress from progressData
  const getModuleProgress = (moduleId) => {
    if (!progressData?.course?.modules) return null;
    return progressData.course.modules.find(m => m.id === moduleId);
  };

  // Get lesson progress status
  const getLessonProgress = (moduleId, lessonId) => {
    const moduleProgress = getModuleProgress(moduleId);
    if (!moduleProgress?.lessons) return { status: 'not_started', timeSpent: 0 };
    const lessonProgress = moduleProgress.lessons.find(l => l.id === lessonId);
    return lessonProgress?.lessonProgress || { status: 'not_started', timeSpent: 0 };
  };

  const currentModuleProgress = getModuleProgress(moduleData.id);
  
  return (
    <motion.div 
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="px-8 py-6 bg-gradient-to-r from-primary-50 via-white to-secondary-50 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center">
            <motion.div 
              className="bg-gradient-to-br from-primary-500 to-primary-600 text-white h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg mr-4 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {moduleIndex + 1}
            </motion.div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{moduleData.title}</h2>
              <div className="flex items-center gap-4 mt-1">
                {moduleData.Lessons && (
                  <p className="text-gray-600">
                    {moduleData.Lessons.length} lessons • {formatDuration(moduleData.Lessons.reduce((total, lesson) => total + (lesson.duration || lesson.estimatedTimeInMinutes || 5), 0))}
                  </p>
                )}
                {currentModuleProgress && (
                  <div className="flex items-center text-sm">
                    <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                      {Math.round(currentModuleProgress.moduleProgress.progress || 0)}% Complete
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Link
            href={`/learner/courses/${courseId}/modules/${moduleData.id}`}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all duration-300 flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>View All Lessons</span>
            <ChevronRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      <div className="p-8">
        {moduleData.description && (
          <motion.div 
            className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-gray-700 leading-relaxed text-lg">{moduleData.description}</p>
          </motion.div>
        )}

        {!moduleData.Lessons || moduleData.Lessons.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-gray-100 rounded-3xl p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lessons Available</h3>
            <p className="text-gray-500">This module doesn't have any lessons yet. Check back soon!</p>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-primary-600" />
                Module Lessons
              </h3>
              <Link 
                href={`/learner/courses/${courseId}/modules/${moduleData.id}`}
                className="text-primary-600 hover:text-primary-800 transition-colors flex items-center font-medium group"
              >
                <span>View full module</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid gap-6">
              {moduleData.Lessons.map((lesson, j) => {
                const lessonProgress = getLessonProgress(moduleData.id, lesson.id);
                const isCompleted = lessonProgress.status === 'completed';
                const isInProgress = lessonProgress.status === 'in_progress';
                
                return (
                  <motion.div 
                    key={lesson.id} 
                    className="group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + j * 0.1, duration: 0.5 }}
                  >
                    <Link
                      href={`/learner/courses/${courseId}/modules/${moduleData.id}/lessons/${lesson.id}`}
                      className="block p-6 rounded-2xl border border-gray-200 hover:border-primary-300 bg-white hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group"
                    >
                      <div className="flex items-start">
                        <motion.div 
                          className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center font-bold mr-4 transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isInProgress 
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {isCompleted ? <CheckCircle size={20} /> : j + 1}
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                              {lesson.title}
                            </h3>
                            {isCompleted && (
                              <div className="flex items-center text-green-600 text-sm font-medium">
                                <CheckCircle size={16} className="mr-1" />
                                Completed
                              </div>
                            )}
                            {isInProgress && (
                              <div className="flex items-center text-yellow-600 text-sm font-medium">
                                <Clock size={16} className="mr-1" />
                                In Progress
                              </div>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{lesson.description}</p>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex items-center mr-6">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{formatDuration(lesson.duration || lesson.estimatedTimeInMinutes)}</span>
                            </div>
                            <div className="flex items-center mr-6">
                              {lesson.type === 'video' ? (
                                <>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  <span>Video Lesson</span>
                                </>
                              ) : (
                                <>
                                  <FileText className="h-4 w-4 mr-2" />
                                  <span>Text Lesson</span>
                                </>
                              )}
                            </div>
                            {lessonProgress.timeSpent > 0 && (
                              <div className="flex items-center">
                                <span className="text-xs">Time spent: {Math.round(lessonProgress.timeSpent / 60)}min</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="self-center ml-4">
                          <motion.div
                            className={`p-3 rounded-xl transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-primary-100 text-primary-600 group-hover:bg-primary-500 group-hover:text-white'
                            }`}
                            whileHover={{ scale: 1.1 }}
                          >
                            <ChevronRight size={20} />
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Full Module View Button */}
            <motion.div 
              className="mt-12 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link
                href={`/learner/courses/${courseId}/modules/${moduleData.id}`}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center font-semibold text-lg transform hover:-translate-y-1"
              >
                <BookmarkCheck className="h-6 w-6 mr-3" />
                <span>View Complete Module</span>
                <ChevronRight className="h-6 w-6 ml-3" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}