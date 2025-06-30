'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../lib/axios';
import Header from '../../components/layout/header';
import Footer from '../../components/layout/footer';

export default function CoursesCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
  });
  // Updated with correct database values
  const [categories] = useState(['mental_health', 'obesity', 'other']);
  const [levels] = useState(['beginner', 'intermediate', 'advanced']);
  
  // Function to format category names for display
  const formatCategory = (category) => {
    if (category === 'mental_health') return 'Mental Health';
    if (category === 'obesity') return 'Obesity';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Function to format level names for display
  const formatLevel = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.level) queryParams.append('level', filters.level);
        if (filters.search) queryParams.append('search', filters.search);
        
        const { data } = await axios.get(`/api/courses?${queryParams}`);
        setCourses(data.data);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        console.error('Error fetching courses:', err);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The search will automatically trigger in the useEffect due to the filters dependency
  };

  // Helper function for badge colors based on level
  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-primary-100 text-primary-800';
      case 'advanced': return 'bg-secondary-100 text-secondary-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function for category badge colors
  const getCategoryBadgeColor = (category) => {
    switch(category) {
      case 'mental_health': return 'bg-blue-100 text-blue-800';
      case 'obesity': return 'bg-purple-100 text-purple-600';
      case 'other': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500/90 to-primary-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-64 -top-64 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-24 bottom-0 w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white text-shadow">
            Course Catalog
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Explore our comprehensive selection of courses designed to enhance your healthcare knowledge and skills
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filters Section */}
          <div className="card-glass mb-8 transition-all hover:shadow-xl">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Courses</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    name="search"
                    className="form-input pl-10 w-full text-black"
                    placeholder="Search courses..."
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  id="category"
                  name="category"
                  className="form-input w-full text-black"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{formatCategory(category)}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                <select
                  id="level"
                  name="level"
                  className="form-input w-full text-black"
                  value={filters.level}
                  onChange={handleFilterChange}
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{formatLevel(level)}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
          
          {/* Content Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
              <p className="text-primary-600 font-medium">Loading courses...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-600 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-red-800 font-medium">{error}</div>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">No courses found</h3>
              <p className="text-gray-500 max-w-md mx-auto">We couldn't find any courses matching your criteria. Try adjusting your search or filter options.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="card card-hover group transition-all">
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gray-100">
                    {course.thumbnailUrl ? (
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <svg className="h-16 w-16 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`badge ${getLevelBadgeColor(course.level)}`}>
                        {formatLevel(course.level)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`badge ${getCategoryBadgeColor(course.category)}`}>
                        {formatCategory(course.category)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                    
                    <p className="text-gray-600 line-clamp-3 mb-4 min-h-[4.5rem]">{course.description}</p>
                    
                    <div className="mt-auto">
                      <Link
                        href={`/preview/courses/${course.id}`}
                        className="inline-flex items-center group w-full justify-center px-4 py-2 rounded-lg bg-white border border-primary-200 text-primary-600 hover:bg-primary-50 font-medium transition-all duration-300"
                      >
                        Preview Course
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}