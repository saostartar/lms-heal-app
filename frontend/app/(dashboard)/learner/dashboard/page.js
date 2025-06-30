"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../../lib/context/auth-context";
import axios from "../../../../lib/axios";

export default function LearnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch learner stats
        const { data: statsData } = await axios.get("/api/learner/stats");
        setStats(statsData.data);

        // Fetch recent courses
        const { data: coursesData } = await axios.get(
          "/api/learner/recent-courses"
        );
        setRecentCourses(coursesData.data);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    setCurrentTime(new Date());
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 rounded-full opacity-25 animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500 animate-pulse">Loading your learning journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-lg shadow-lg my-8 max-w-3xl mx-auto">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 rounded-2xl overflow-hidden mb-10 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10 pattern-dots pattern-white pattern-bg-transparent pattern-size-4"></div>
        <div className="absolute right-0 bottom-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-48 h-48 text-white opacity-10">
            <path fill="currentColor" d="M139.5 33.4c24.8 16.7 36.2 53.5 24.7 79.8-11.5 26.2-45.9 42-73.8 39.3-27.9-2.8-49.4-24.1-54.8-50.2-5.5-26.2 5.2-57.3 28.9-74C88.2 11.5 124.9 8.8 139.5 33.4z"/>
          </svg>
        </div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white backdrop-blur-sm mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span>Active Learner</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-primary-100 text-lg max-w-xl">
              Track your learning progress, continue your courses, and reach your goals!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white flex items-center">
              <div className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Last login</p>
                <p className="font-semibold">{currentTime.toLocaleDateString()} at {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          <div className="p-6 relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-white transition-colors duration-500">Your Progress</h2>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-bold text-gray-800 group-hover:text-white transition-colors duration-500">
                {stats?.completedCoursesCount || 0}
              </div>
              <div className="text-sm font-medium text-gray-500 group-hover:text-green-100 transition-colors duration-500">Completed Courses</div>
            </div>
            <div className="absolute bottom-0 right-0 transform translate-y-1/3 translate-x-1/3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-gray-100 group-hover:text-white group-hover:opacity-20 transition-colors duration-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          <div className="p-6 relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-white transition-colors duration-500">Active Enrollments</h2>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.775-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-bold text-gray-800 group-hover:text-white transition-colors duration-500">
                {stats?.activeEnrollmentsCount || 0}
              </div>
              <div className="text-sm font-medium text-gray-500 group-hover:text-blue-100 transition-colors duration-500">Courses In Progress</div>
            </div>
            <div className="absolute bottom-0 right-0 transform translate-y-1/3 translate-x-1/3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-gray-100 group-hover:text-white group-hover:opacity-20 transition-colors duration-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          <div className="p-6 relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-white transition-colors duration-500">Learning Time</h2>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-bold text-gray-800 group-hover:text-white transition-colors duration-500">
                {stats?.totalLearningHours || 0}
              </div>
              <div className="text-sm font-medium text-gray-500 group-hover:text-purple-100 transition-colors duration-500">Hours Spent Learning</div>
            </div>
            <div className="absolute bottom-0 right-0 transform translate-y-1/3 translate-x-1/3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-gray-100 group-hover:text-white group-hover:opacity-20 transition-colors duration-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="w-1.5 h-6 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-3"></span>
              Continue Learning
            </h2>
            <p className="text-gray-600 mt-1 ml-4">Pick up where you left off</p>
          </div>
          <Link
            href="/learner/my-courses"
            className="mt-2 md:mt-0 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300 group">
            <span>View all courses</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-500 group-hover:text-primary-500 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.775-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-6">Start your learning journey today by enrolling in a course</p>
            <Link
              href="/courses"
              className="inline-flex items-center px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col group">
                <div className="h-3 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="p-6 flex-grow">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-1">{course.title}</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transform origin-left transition-transform duration-500 ease-out"
                        style={{ width: `${course.progress}%`, transform: 'translateZ(0)' }}>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <Link
                    href={`/learner/courses/${course.id}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 hover:bg-primary-50 text-primary-600 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-lg transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learning Tips Section */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 overflow-hidden relative mb-10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100 rounded-full transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-100 rounded-full transform -translate-x-16 translate-y-12"></div>
        
        <div className="relative">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Learning Tip</h2>
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg border border-primary-100">
            <div className="flex items-start">
              <div className="bg-white p-2 rounded-lg shadow-md mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Consistency is key to learning</h3>
                <p className="text-gray-600">
                  Studies show that studying for 30 minutes daily is more effective than cramming for hours once a week. 
                  Try to establish a regular learning routine - even short, focused sessions can lead to significant progress!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Goal Progress */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Goal</h2>
            <p className="text-gray-600 mt-1">Track your progress toward your learning goal</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Monthly Goal
            </span>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className="text-sm text-blue-600 font-medium mb-1">Hours learned this month</div>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalLearningHours || 0} / 20</div>
            </div>
            <div className="w-full md:w-64 h-4 bg-white rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(((stats?.totalLearningHours || 0) / 20) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center text-sm text-blue-700">
            {stats?.totalLearningHours >= 20 
              ? "Congratulations! You've reached your monthly learning goal! 🎉" 
              : `You're ${20 - (stats?.totalLearningHours || 0)} hours away from reaching your monthly goal!`}
          </div>
        </div>
      </div>
    </div>
  );
}