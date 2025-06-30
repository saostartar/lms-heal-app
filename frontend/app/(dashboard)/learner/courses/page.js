'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../../../lib/axios';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
  });
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState(['Beginner', 'Intermediate', 'Advanced']);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Format category for display
  const formatCategory = (category) => {
    if (category === 'mental_health') return 'Mental Health';
    if (category === 'obesity') return 'Obesity';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Get category color class
  const getCategoryColor = (category) => {
    switch(category) {
      case 'mental_health': return 'from-blue-400 to-indigo-500';
      case 'obesity': return 'from-purple-400 to-pink-500';
      default: return 'from-emerald-400 to-teal-500';
    }
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
        
        // Extract unique categories if not loaded yet
        if (categories.length === 0) {
          const uniqueCategories = [...new Set(data.data.map(course => course.category))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        console.error(err);
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
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      search: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 rounded-b-[3rem] mb-8 shadow-xl">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative px-6 py-12 sm:px-10 sm:py-20 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            <span className="block">Discover Your</span>
            <span className="block text-white/90">Learning Path</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mb-8">
            Explore our hand-picked courses designed to advance your knowledge and transform your career.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              name="search"
              placeholder="Search for a course..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-14 pr-16 py-4 rounded-full shadow-lg border-0 focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-md text-white placeholder-white/60"
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button onClick={() => setFilterOpen(!filterOpen)} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-white/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Filter Panel */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 transition-all duration-500 ease-in-out ${filterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Advanced Filters</h2>
            <button 
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Clear Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilters(prev => ({...prev, category: ''}))}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filters.category === '' 
                      ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500 ring-offset-1' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-all duration-200`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button 
                    key={category}
                    onClick={() => setFilters(prev => ({...prev, category}))}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      filters.category === category 
                        ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500 ring-offset-1' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-all duration-200`}
                  >
                    {formatCategory(category)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilters(prev => ({...prev, level: ''}))}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filters.level === '' 
                      ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500 ring-offset-1' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-all duration-200`}
                >
                  All
                </button>
                {levels.map((level) => (
                  <button 
                    key={level}
                    onClick={() => setFilters(prev => ({...prev, level: level.toLowerCase()}))}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      filters.level === level.toLowerCase() 
                        ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500 ring-offset-1' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-all duration-200`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Available Courses</h2>
          <div className="text-sm text-gray-500">{courses.length} results</div>
        </div>
        
        {loading ? (
          <div className="py-20">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="text-primary-600 font-medium">Loading courses...</div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-center">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-600 max-w-md mx-auto">We couldn't find any courses matching your criteria. Try adjusting your filters or check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 z-10 m-2">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-md bg-gradient-to-r ${getCategoryColor(course.category)}`}>
                    {formatCategory(course.category)}
                  </div>
                </div>
                
                <div className="h-48 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="px-3 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-800 border border-primary-100">
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </div>
                    {course.instructor && (
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-1">
                          {course.instructor.profileImage ? (
                            <img src={course.instructor.profileImage} alt={course.instructor.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">{course.instructor.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="truncate">{course.instructor.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">{course.title}</h3>
                  
                  <p className="text-gray-600 line-clamp-3 mb-6 min-h-[4.5rem]">{course.description}</p>
                  
                  <Link
                    href={`/learner/courses/${course.id}`}
                    className="w-full inline-block text-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-sm hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    View Course
                  </Link>
                </div>
                
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary-500/30 rounded-2xl pointer-events-none transition-all duration-300"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}