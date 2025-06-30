'use client';

import { useState, useEffect } from 'react';
import axios from '../../../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30days');
  const [sectionLoading, setSectionLoading] = useState({
    overview: true,
    courses: true,
    forum: true,
    news: true
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);
  
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setSectionLoading(prev => ({ ...prev, overview: true }));
      
      // Fetch platform statistics with timeframe parameter
      const { data: platformData } = await axios.get('/api/analytics/platform', {
        params: { timeframe }
      });
      setStats(platformData.data);
      setSectionLoading(prev => ({ ...prev, overview: false, forum: false, news: false }));
      
      // Fetch top courses
      setSectionLoading(prev => ({ ...prev, courses: true }));
      const { data: coursesData } = await axios.get('/api/analytics/top-courses');
      setCourseData(coursesData.data);
      setSectionLoading(prev => ({ ...prev, courses: false }));
      
    } catch (err) {
      console.error('Analytics error:', err);
      setError('Failed to load analytics data. Please try again later.');
      setSectionLoading({
        overview: false,
        courses: false,
        forum: false,
        news: false
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };
  
  const handleRefresh = () => {
    fetchAnalytics();
  };
  
  const exportAnalyticsData = () => {
    if (!stats) return;
    
    const exportData = {
      platformStats: stats,
      courseData: courseData,
      exportDate: new Date().toISOString(),
      timeframe
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-primary-300 border-b-primary-200 border-l-primary-400 animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-4 border-t-secondary-500 border-r-transparent border-b-secondary-300 border-l-transparent animate-spin-slow"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8 bg-red-50 border border-red-200 rounded-xl shadow-inner">{error}</div>;
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-10 mb-8 bg-white bg-opacity-80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent pb-1">
            Analytics Dashboard
          </h1>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <select
              value={timeframe}
              onChange={handleTimeframeChange}
              className="form-select border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
            
            <button
              onClick={handleRefresh}
              className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-primary-600 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <button
              onClick={exportAnalyticsData}
              disabled={!stats}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg shadow-sm hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Data
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        {/* Key Metrics Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 pl-2 border-l-4 border-primary-500">
            Key Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="overflow-hidden group transform transition-all hover:-translate-y-1 hover:shadow-lg relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary-400"></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">New Users</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-primary-600 transition-colors">
                      {stats?.newUsers || 0}
                    </h3>
                  </div>
                  <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group transform transition-all hover:-translate-y-1 hover:shadow-lg relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-primary-600 transition-colors">
                      {stats?.activeUsers || 0}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{stats?.activeUsersLastWeek || 0} last week</p>
                  </div>
                  <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group transform transition-all hover:-translate-y-1 hover:shadow-lg relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary-600"></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">New Enrollments</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-primary-600 transition-colors">
                      {stats?.newEnrollments || 0}
                    </h3>
                  </div>
                  <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden relative bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md transform transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-white/80">Course Completions</p>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-2xl font-bold">{stats?.courseCompletions || 0}</h3>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <span className="text-white">{stats?.avgCompletionRate || 0}%</span>
                    <span>avg. rate</span>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-30"></div>
            </Card>
          </div>
        </div>
        
        {/* User Distribution */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 pl-2 border-l-4 border-secondary-500">
            User Distribution
          </h2>
          <Card className="bg-white shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 bg-gradient-to-br from-secondary-50 to-white md:w-1/3 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">User Roles</h3>
                  <p className="text-sm text-gray-600 mb-2">Breakdown of users by their designated roles in the platform</p>
                  <div className="mt-2">
                    <div className="text-xs text-secondary-600 font-semibold">Total Users: {stats?.totalUsers || 0}</div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Learners</span>
                        <span className="text-sm text-gray-700">{stats?.usersByRole?.learners || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-secondary-600 h-2.5 rounded-full" 
                          style={{ width: `${stats?.totalUsers ? (stats.usersByRole?.learners / stats.totalUsers) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Instructors</span>
                        <span className="text-sm text-gray-700">{stats?.usersByRole?.instructors || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-secondary-500 h-2.5 rounded-full" 
                          style={{ width: `${stats?.totalUsers ? (stats.usersByRole?.instructors / stats.totalUsers) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Admins</span>
                        <span className="text-sm text-gray-700">{stats?.usersByRole?.admins || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-secondary-400 h-2.5 rounded-full" 
                          style={{ width: `${stats?.totalUsers ? (stats.usersByRole?.admins / stats.totalUsers) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Top Courses */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 pl-2 border-l-4 border-primary-500">
            Top Performing Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-all bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100 rounded-full -mr-20 -mt-20 group-hover:bg-primary-200 transition-colors"></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800">
                    Top Courses by Enrollment
                  </CardTitle>
                  {sectionLoading.courses && (
                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative">
                {sectionLoading.courses ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-3 w-full">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : courseData?.topEnrollments?.length > 0 ? (
                  <div className="space-y-3">
                    {courseData.topEnrollments.map((course, index) => (
                      <div 
                        key={course.id} 
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-50 text-blue-600'
                          } font-bold text-sm`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-800 truncate max-w-[180px]">
                            {course.title}
                          </span>
                        </div>
                        <span className="font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full text-sm">
                          {course.count} <span className="text-xs font-normal">students</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">No data available</div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100 rounded-full -mr-20 -mt-20 group-hover:bg-primary-200 transition-colors"></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800">
                    Top Courses by Completion
                  </CardTitle>
                  {sectionLoading.courses && (
                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative">
                {sectionLoading.courses ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-3 w-full">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : courseData?.topCompletionRates?.length > 0 ? (
                  <div className="space-y-3">
                    {courseData.topCompletionRates.map((course, index) => (
                      <div 
                        key={course.id} 
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 ${
                            index === 0 ? 'bg-green-100 text-green-700' :
                            index === 1 ? 'bg-emerald-100 text-emerald-700' :
                            index === 2 ? 'bg-teal-100 text-teal-700' :
                            'bg-cyan-50 text-cyan-600'
                          } font-bold text-sm`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-800 truncate max-w-[180px]">
                            {course.title}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
                            {course.rate}%
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{course.count} students</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Content Statistics */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 pl-2 border-l-4 border-secondary-500">
            Content & Community
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* News Articles Card */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-all border-b-4 border-secondary-400 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-secondary-400 to-secondary-300"></div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">News Articles</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-bold text-gray-800">{stats?.totalNewsArticles || 0}</span>
                      <span className="text-sm text-gray-500">total</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {stats?.publishedNewsArticles || 0} published articles
                    </p>
                  </div>
                  <div className="bg-secondary-100 p-2 rounded-lg text-secondary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Card */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-all border-b-4 border-primary-400 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-300"></div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Courses</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-bold text-gray-800">{stats?.totalCourses || 0}</span>
                      <span className="text-sm text-gray-500">courses</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {stats?.totalEnrollments || 0} total enrollments
                    </p>
                  </div>
                  <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forum Topics Card */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-all border-b-4 border-secondary-500 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-secondary-500 to-secondary-400"></div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Forum Topics</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-bold text-gray-800">{stats?.forumTopics || 0}</span>
                      <span className="text-sm text-gray-500">topics</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {stats?.activeForumTopics || 0} active topics
                    </p>
                  </div>
                  <div className="bg-secondary-100 p-2 rounded-lg text-secondary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Forum Posts Card */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-all border-b-4 border-primary-500 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-400"></div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Forum Posts</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-bold text-gray-800">{stats?.forumPosts || 0}</span>
                      <span className="text-sm text-gray-500">posts</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {stats?.forumPostsThisWeek || 0} posts this week
                    </p>
                  </div>
                  <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Forum Activity */}
        <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-5 text-gray-800">
              <span className="border-b-2 border-primary-500 pb-1">Forum Activity Overview</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow p-5 transform transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Topics & Posts</h3>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-1 items-center">
                      <span className="text-sm font-medium text-gray-700">Topics</span>
                      <span className="text-sm font-bold text-primary-600">{stats?.forumTopics || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-1 items-center">
                      <span className="text-sm font-medium text-gray-700">Posts</span>
                      <span className="text-sm font-bold text-primary-600">{stats?.forumPosts || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-5 transform transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Active Topics</h3>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                </div>
                <div className="flex items-center justify-center h-24">
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-gray-800">{stats?.activeForumTopics || 0}</span>
                    <span className="text-sm text-gray-500">With recent activity</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-5 transform transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Recent Posts</h3>
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                </div>
                <div className="flex items-center justify-center h-24">
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-gray-800">{stats?.forumPostsThisWeek || 0}</span>
                    <span className="text-sm text-gray-500">In the last 7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}