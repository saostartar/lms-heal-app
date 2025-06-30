'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../../../../lib/axios';

export default function CoursesAnalytics() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEnrollments: 0,
    activeStudents: 0,
    avgCompletionRate: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30days');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: dashboardData } = await axios.get('/api/instructor/dashboard', {
          params: { timeframe }
        });
        
        if (dashboardData.success) {
          const { courses: coursesList, stats: statsData } = dashboardData.data;
          
          setCourses(coursesList.map(course => ({
            ...course,
            completionRate: course.enrollments > 0 
              ? statsData.completionRate || 0 
              : 0
          })));
          
          setStats({
            totalStudents: statsData.totalStudents || 0,
            totalEnrollments: statsData.totalEnrollments || 0,
            activeStudents: statsData.activeStudents || 0,
            avgCompletionRate: statsData.completionRate || 0,
            totalRevenue: statsData.totalRevenue || 0
          });
        }
      } catch (err) {
        setError('Failed to load analytics: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-primary-300 border-b-primary-200 border-l-primary-400 animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-4 border-t-secondary-500 border-r-transparent border-b-secondary-300 border-l-transparent animate-spin-slow"></div>
          <div className="absolute inset-[18px] bg-white rounded-full shadow-inner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-6 bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-xl shadow-inner">
        <div className="inline-flex p-4 mb-5 bg-red-100 text-red-500 rounded-full backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 mb-8 backdrop-blur-md border-b border-gray-100 shadow-sm bg-white bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 animate-gradient-x pb-1">
                Course Analytics
              </span>
            </h1>
            
            <div className="mt-4 sm:mt-0 relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm hover:border-primary-300 bg-white transition-all duration-300 ease-in-out cursor-pointer"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Enrollments Card */}
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 animate-gradient-x"></div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Enrollments</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-gray-800 group-hover:text-primary-600 transition-colors duration-300">
                      {stats.totalEnrollments}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">students</span>
                  </div>
                </div>
                <div className="bg-primary-50 p-3 rounded-xl text-primary-600 group-hover:bg-primary-100 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Students Card */}
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
            <div className="h-1.5 bg-gradient-to-r from-green-500 via-green-400 to-green-500 animate-gradient-x"></div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Active Students</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                      {stats.activeStudents}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">active</span>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-xl text-green-600 group-hover:bg-green-100 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Completion Rate Card */}
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 animate-gradient-x"></div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Avg. Completion Rate</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                      {stats.avgCompletionRate?.toFixed(1) || 0}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">%</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Revenue Card */}
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
            <div className="h-1.5 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 animate-gradient-x"></div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Revenue</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                      ${stats.totalRevenue?.toFixed(2) || 0}
                    </span>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Courses Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="p-6 border-b border-gray-100 bg-gray-50 bg-opacity-70">
            <h2 className="text-lg font-bold text-gray-800">Course Performance</h2>
          </div>
          
          {courses.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex p-4 mb-5 bg-gray-100 text-gray-500 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">You haven't created any courses yet.</p>
              <Link 
                href="/instructor/courses/create" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all duration-300 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50 bg-opacity-70">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollments</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                          {course.title}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 border border-primary-200">
                          {course.enrollments || 0} students
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-3 text-sm font-medium text-gray-700">
                            {course.completionRate.toFixed(1)}%
                          </span>
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-primary-500 to-primary-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${Math.max(3, course.completionRate)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <Link 
                          href={`/instructor/analytics/${course.id}`}
                          className="text-primary-600 hover:text-primary-800 inline-flex items-center font-medium text-sm bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-all duration-200"
                        >
                          View Details
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}