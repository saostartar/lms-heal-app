'use client';

import { useState, useEffect } from 'react';
import axios from '../../../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get('/api/analytics/platform');
        setStats(data.data);
      } catch (err) {
        setError('Failed to load platform statistics');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 border-opacity-75"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md text-red-700 text-center">
        <p className="font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-12 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 flex items-center">
        <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Admin Dashboard</span>
      </h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500 opacity-5 rounded-full transform translate-x-8 -translate-y-8"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500 opacity-5 rounded-full transform translate-x-8 -translate-y-8"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary-600">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats?.totalCourses || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500 opacity-5 rounded-full transform translate-x-8 -translate-y-8"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary-600">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats?.totalEnrollments || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-secondary-500 opacity-5 rounded-full transform translate-x-8 -translate-y-8"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-secondary-600">Active Users (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats?.activeUsersLastWeek || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Content & Community Stats */}
      <h2 className="text-xl font-semibold mb-4 text-gray-700 pl-1">Content & Community</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-primary-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">News Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats?.totalNewsArticles || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-primary-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats?.publishedNewsArticles || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-secondary-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Forum Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats?.forumTopics || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-secondary-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Forum Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats?.forumPosts || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Breakdown */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-xl overflow-hidden">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-700">Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 hover:bg-blue-50 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Learners</span>
                <span className="font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{stats?.usersByRole?.learners || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-blue-50 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Instructors</span>
                <span className="font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{stats?.usersByRole?.instructors || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-blue-50 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Admins</span>
                <span className="font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{stats?.usersByRole?.admins || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Forum Stats */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-xl overflow-hidden">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-700">Forum Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 hover:bg-purple-50 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Categories</span>
                <span className="font-semibold text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full">{stats?.forumCategories || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-purple-50 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Active Topics</span>
                <span className="font-semibold text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full">{stats?.activeForumTopics || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-purple-50 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Posts This Week</span>
                <span className="font-semibold text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full">{stats?.forumPostsThisWeek || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-xl overflow-hidden">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-700">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Link href="/admin/courses" className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 rounded-lg group transition-all">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <span className="text-sm font-bold">C</span>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary-700">Manage Courses</span>
              </Link>
              
              <Link href="/admin/users" className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 rounded-lg group transition-all">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <span className="text-sm font-bold">U</span>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary-700">Manage Users</span>
              </Link>
              
              <Link href="/admin/news" className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 rounded-lg group transition-all">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <span className="text-sm font-bold">N</span>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary-700">Manage News</span>
              </Link>
              
              <Link href="/admin/forum" className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 rounded-lg group transition-all">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <span className="text-sm font-bold">F</span>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary-700">Manage Forum</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}