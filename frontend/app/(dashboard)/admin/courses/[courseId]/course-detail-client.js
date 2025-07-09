'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';

export default function AdminCourseDetailClient({ initialCourse, initialModules, initialEnrollments, params }) {
  const { courseId } = params;
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState(initialModules);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [loading, setLoading] = useState(!initialCourse); // Only show loading if no initial data
  const [error, setError] = useState(null);

  // This useEffect can be kept for client-side updates if needed,
  // but the initial load is now handled by the server component.
  useEffect(() => {
    if (!initialCourse) {
      const fetchCourseData = async () => {
        try {
          setLoading(true);
          const { data: courseData } = await axios.get(`/api/courses/${courseId}`);
          setCourse(courseData.data);
          const { data: modulesData } = await axios.get(`/api/modules/course/${courseId}`);
          setModules(modulesData.data);
          const { data: enrollmentsData } = await axios.get(`/api/enrollments/course/${courseId}`);
          setEnrollments(enrollmentsData.data || []);
        } catch (err) {
          setError('Failed to load course: ' + (err.response?.data?.message || err.message));
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourseData();
    }
  }, [courseId, initialCourse]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/courses/${courseId}`);
      router.push('/admin/courses');
    } catch (err) {
      alert('Failed to delete course: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  // Format category for display
  const formatCategory = (category) => {
    if (category === 'mental_health') return 'Mental Health';
    if (category === 'obesity') return 'Obesity';
    return category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  };
  
  // Format level for display
  const formatLevel = (level) => {
    return level ? level.charAt(0).toUpperCase() + level.slice(1) : '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="relative">
          <div className="animate-ping absolute h-16 w-16 rounded-full bg-primary-400 opacity-75"></div>
          <div className="animate-spin relative rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass border-l-4 border-red-500 bg-red-50 p-6 mx-auto max-w-3xl my-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <div className="text-red-700 font-medium">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="card-glass flex flex-col items-center justify-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-lg text-gray-500 font-medium">Course not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-8">
      {/* Header with breadcrumb */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg mb-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-2">
            <Link href="/admin/courses" className="text-primary-100 hover:text-white hover:underline inline-flex items-center transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back to Courses
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white m-0 tracking-tight">{course.title}</h1>
            <button 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-sm transition-all hover:shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete Course
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card card-hover md:col-span-2 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-primary-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A1 1 0 0110 4h.01a1 1 0 01.99.804l.5 8.5a1 1 0 01-.99 1.196h-.01a1 1 0 01-.99-1.196l.5-8.5z" />
                <path d="M10 15a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              Course Details
            </h2>
            
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-md font-medium mb-2 text-gray-700">Description</h3>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
                <h3 className="text-md font-medium mb-2 text-primary-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7z" />
                    <path fillRule="evenodd" d="M4 4a1 1 0 011-1h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm1 2v10h10V6H5z" clipRule="evenodd" />
                  </svg>
                  Category
                </h3>
                <p className="text-primary-800 font-medium">{formatCategory(course.category)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-4 rounded-lg border border-secondary-200">
                <h3 className="text-md font-medium mb-2 text-secondary-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l3-3 2 2 1-1 2 2V6z" clipRule="evenodd" />
                  </svg>
                  Level
                </h3>
                <p className="text-secondary-800 font-medium">{formatLevel(course.level)}</p>
              </div>
            </div>
          </div>

          <div className="card card-hover transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-primary-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Instructor
            </h2>
            
            {course.instructor ? (
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="avatar avatar-primary h-20 w-20 mb-3 text-xl">
                  {course.instructor.name.charAt(0)}
                </div>
                <p className="font-medium text-lg">{course.instructor.name}</p>
                <p className="text-primary-600 text-sm mb-3">{course.instructor.email}</p>
                {course.instructor.bio && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg w-full">
                    <p className="italic">{course.instructor.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
                Instructor information not available
              </div>
            )}
          </div>
        </div>

        {/* Modules Section */}
        <div className="card card-hover mb-8 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-primary-700 border-b border-gray-200 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7z" />
              <path fillRule="evenodd" d="M4 6a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6zm2 1v8h8V7H6z" clipRule="evenodd" />
            </svg>
            Course Modules
          </h2>
          
          {modules.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No modules available for this course</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <div key={module.id} className="bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 p-4">
                  <div className="flex items-center">
                    <div className="bg-primary-100 text-primary-700 rounded-full h-8 w-8 flex items-center justify-center font-semibold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{module.title}</h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollments Section */}
        <div className="card card-hover mb-8 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-primary-700 border-b border-gray-200 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Enrollments 
            <span className="bg-primary-100 text-primary-800 text-sm ml-2 py-1 px-2 rounded-full">
              {enrollments.length}
            </span>
          </h2>
          
          {enrollments.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-500">No students enrolled in this course yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="avatar avatar-primary h-10 w-10 mr-3 text-sm">
                            {enrollment.user?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.user?.name || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500">{enrollment.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {new Date(enrollment.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full ${
                              enrollment.progress >= 80 ? 'bg-green-500' : 
                              enrollment.progress >= 50 ? 'bg-primary-500' : 
                              enrollment.progress >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium mt-1 text-right">{Math.round(enrollment.progress)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          enrollment.isCompleted 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {enrollment.isCompleted ? 'Completed' : 'In Progress'}
                        </span>
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