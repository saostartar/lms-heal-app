"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "../../../../lib/axios";

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/courses/instructor/courses");
        setCourses(data.data);
      } catch (err) {
        setError(
          "Failed to load courses: " +
            (err.response?.data?.message || err.message)
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl shadow-lg mb-8 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-white m-0 tracking-tight drop-shadow-sm">
            My Courses
          </h1>
          <Link 
            href="/instructor/courses/create" 
            className="mt-4 md:mt-0 btn bg-white text-primary-600 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-600/20 group"
          >
            <span>Create New Course</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading your courses...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center text-red-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold">Error</h2>
            </div>
            <p className="text-gray-700">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xl p-10 max-w-3xl mx-auto text-center border border-gray-100">
            <div className="bg-primary-50 inline-flex rounded-full p-4 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">You haven't created any courses yet</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start creating educational content that makes a difference. Your expertise matters.
            </p>
            <Link
              href="/instructor/courses/create"
              className="btn btn-primary inline-flex items-center px-6 py-3 text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="card card-hover group bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="h-2 bg-gradient-to-r from-primary-400 to-secondary-500 group-hover:h-3 transition-all duration-300"></div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">{course.title}</h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {course.description}
                  </p>
                  <div className="flex space-x-4 mt-6">
                    <Link
                      href={`/instructor/courses/${course.id}`}
                      className="btn btn-primary flex items-center justify-center flex-1 py-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <Link
                      href={`/instructor/analytics/${course.id}`}
                      className="btn btn-outline flex items-center justify-center flex-1 py-3 border-2 hover:bg-secondary-50 hover:border-secondary-400 hover:text-secondary-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Analytics
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}