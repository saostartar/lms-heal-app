'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../../../lib/axios';
import { PieChart, BarChart, Users, BookOpen, Award, TrendingUp, AlertTriangle, Clock, Plus } from 'react-feather';

export default function InstructorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    stats: {
      totalStudents: 0,
      totalCourses: 0,
      publishedCourses: 0,
      totalEnrollments: 0,
      completionRate: 0,
      averageRating: 0
    },
    recentActivities: [],
    popularCourses: [],
    lowCompletionCourses: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch instructor dashboard data
        const { data } = await axios.get('/api/instructor/dashboard');
        setDashboardData(data.data);
      } catch (err) {
        setError('Failed to load dashboard data: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mt-6 shadow-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, courses, recentActivities, popularCourses, lowCompletionCourses } = dashboardData;

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-2"></div>
          Instructor Dashboard
        </h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your teaching progress.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 group-hover:h-2 group-hover:w-full group-hover:opacity-20 transition-all duration-300"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-500 font-medium uppercase tracking-wider text-xs mb-1">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/instructor/analytics/students" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
              <span>View all students</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="card overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-2 h-full bg-green-500 group-hover:h-2 group-hover:w-full group-hover:opacity-20 transition-all duration-300"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-500 font-medium uppercase tracking-wider text-xs mb-1">Total Courses</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-green-600">{stats.totalCourses}</p>
                <p className="text-sm ml-2 text-gray-500">{stats.publishedCourses} published</p>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/instructor/courses" 
                  className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center">
              <span>Manage your courses</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="card overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-2 h-full bg-purple-500 group-hover:h-2 group-hover:w-full group-hover:opacity-20 transition-all duration-300"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-500 font-medium uppercase tracking-wider text-xs mb-1">Completion Rate</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-purple-600">{stats.completionRate}%</p>
                <p className="text-sm ml-2 text-gray-500">{stats.totalEnrollments} enrollments</p>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/instructor/analytics/courses" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center">
              <span>View detailed analytics</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Recent Courses */}
        <div className="card card-hover bg-gradient-to-br from-white to-gray-50/80">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
              Recent Courses
            </h2>
            <Link href="/instructor/courses/create" 
                  className="btn btn-primary btn-sm py-1.5 px-3 text-sm">
              <Plus className="h-4 w-4 mr-1" />
              Create New
            </Link>
          </div>
          
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-300">
              <div className="bg-primary-50 p-3 rounded-full mb-2">
                <Plus className="h-6 w-6 text-primary-500" />
              </div>
              <p className="text-gray-500 mb-3">You haven't created any courses yet.</p>
              <Link href="/instructor/courses/create" 
                    className="btn btn-outline btn-sm py-1.5 px-4 text-sm">
                Create your first course
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <div key={course.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800 truncate max-w-[200px]">{course.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      course.isPublished 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrollments || 0} students
                    </span>
                    <Link href={`/instructor/courses/${course.id}`} 
                          className="text-primary-600 hover:text-primary-800 font-medium flex items-center">
                      <span>Manage</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
              {courses.length > 3 && (
                <div className="flex justify-center mt-4">
                  <Link href="/instructor/courses" 
                        className="flex items-center text-primary-600 hover:text-primary-800 font-medium">
                    <span>View all courses</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Analytics Overview */}
        <div className="card card-hover bg-gradient-to-br from-white to-gray-50/80">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
              Analytics Overview
            </h2>
            <div className="flex space-x-1">
              <div className="p-1 rounded hover:bg-gray-100">
                <PieChart className="h-5 w-5 text-gray-500" />
              </div>
              <div className="p-1 rounded hover:bg-gray-100">
                <BarChart className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Popular Courses */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                Popular Courses
              </h3>
              
              {popularCourses.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">No data available yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {popularCourses.map((course, index) => (
                    <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-800 truncate max-w-[240px]">{course.title}</div>
                      <div className="text-sm bg-green-50 text-green-800 px-2 py-0.5 rounded-full font-medium border border-green-100">
                        {course.enrollments} students
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Courses Needing Attention */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                Courses Needing Attention
              </h3>
              
              {lowCompletionCourses.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">No courses need attention</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lowCompletionCourses.map((course, index) => (
                    <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-800 truncate max-w-[240px]">{course.title}</div>
                      <div className="text-sm bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-medium border border-amber-100">
                        {course.completionRate}% completion
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/instructor/analytics/courses" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-all duration-300 font-medium">
              <span>View detailed analytics</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="card card-hover bg-gradient-to-br from-white to-gray-50/80 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Recent Activity
          </h2>
        </div>
        
        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-100 p-3 rounded-full mb-2">
              <Clock className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-gray-500">No recent activities to display.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 divide-y divide-gray-100">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start py-3 first:pt-0 last:pb-0">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'enrollment' ? 'bg-green-100 text-green-600 border border-green-200' :
                  activity.type === 'completion' ? 'bg-blue-100 text-blue-600 border border-blue-200' :
                  activity.type === 'review' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                  'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {activity.type === 'enrollment' ? (
                    <Users className="h-4 w-4" />
                  ) : activity.type === 'completion' ? (
                    <Award className="h-4 w-4" />
                  ) : activity.type === 'review' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-800 font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <Link href="/instructor/courses/create" className="group">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-primary-200">
            <div className="h-2 bg-primary-500 group-hover:bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"></div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors duration-300">Create Course</span>
            </div>
          </div>
        </Link>
        
        <Link href="/instructor/analytics/courses" className="group">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-primary-200">
            <div className="h-2 bg-secondary-500 group-hover:bg-gradient-to-r from-secondary-500 to-secondary-400 transition-all duration-300"></div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="bg-secondary-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-secondary-700 transition-colors duration-300">View Analytics</span>
            </div>
          </div>
        </Link>
        
        <Link href="/instructor/analytics/quizzes" className="group">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-primary-200">
            <div className="h-2 bg-blue-500 group-hover:bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"></div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-300">Quiz Results</span>
            </div>
          </div>
        </Link>
        
        <Link href="/profile" className="group">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-primary-200">
            <div className="h-2 bg-green-500 group-hover:bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"></div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="bg-green-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-300">Update Profile</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}