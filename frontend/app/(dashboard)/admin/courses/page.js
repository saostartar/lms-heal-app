'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../../../lib/axios';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Prepare params based on filters
        const params = new URLSearchParams();
        
        // Only add non-empty filters
        if (filters.search) params.append('search', filters.search);
        
        const response = await axios.get(`/api/courses?${params.toString()}`);
        setCourses(response.data.data);
        
        // Debug response
        console.log('API Response:', response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/courses/${courseId}`);
      
      // Remove the course from the state
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete course: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white m-0 tracking-tight">Manage Courses</h1>
          <span className="bg-white bg-opacity-20 text-white text-sm font-medium px-3 py-1 rounded-full">
            {courses.length} Course{courses.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Search bar with enhanced styling */}
      <div className="card-glass hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Courses</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="form-input w-full pl-10 text-black"
                placeholder="Search by title or description"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading state with improved animation */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="relative">
            <div className="animate-ping absolute h-16 w-16 rounded-full bg-primary-400 opacity-75"></div>
            <div className="animate-spin relative rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        </div>
      ) : error ? (
        <div className="card-glass border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-red-700 font-medium">{error}</div>
            </div>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="card-glass bg-gray-50 flex flex-col items-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-lg text-gray-500 font-medium">No courses found</p>
          <p className="text-gray-400">Try adjusting your filters or adding new courses</p>
        </div>
      ) : (
        <div className="card-glass overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="avatar avatar-primary h-8 w-8 mr-2 text-xs">
                          {course.instructor?.name?.charAt(0) || '?'}
                        </div>
                        <div className="text-sm text-gray-700">{course.instructor?.name || 'Unknown'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-primary capitalize">
                        {course.category === 'mental_health' ? 'Mental Health' : 
                         course.category === 'obesity' ? 'Obesity' : 
                         course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/admin/courses/${course.id}`} className="btn btn-outline text-xs py-1 px-3">
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleDelete(course.id)} 
                          className="btn text-xs py-1 px-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}