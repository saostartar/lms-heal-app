"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "../../../../../lib/axios";
import CourseForm from "../../../../../components/instructor/CourseForm";

export default function CourseDetail({ params }) {
  const { courseId } = params;
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const { data: courseData } = await axios.get(
          `/api/courses/${courseId}?includeUnpublished=true&includeUnapproved=true`
        );
        setCourse(courseData.data);

        const { data: modulesData } = await axios.get(
          `/api/modules/course/${courseId}`
        );
        setModules(modulesData.data);
      } catch (err) {
        setError(
          "Failed to load course: " +
            (err.response?.data?.message || err.message)
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/courses/${courseId}`);
      router.push("/instructor/courses");
    } catch (err) {
      alert(
        "Failed to delete course: " +
          (err.response?.data?.message || err.message)
      );
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-primary-600 animate-spin"></div>
          <div className="absolute inset-0 h-20 w-20 rounded-full border-r-4 border-l-4 border-transparent border-opacity-50 animate-ping"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-3xl mx-auto my-8 shadow-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl shadow-md max-w-3xl mx-auto">
        <svg
          className="h-20 w-20 text-gray-400 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Course Not Found
        </h3>
        <p className="text-gray-600">
          The course you're looking for doesn't exist or has been moved.
        </p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary-700 flex items-center gap-3 m-0">
            <span className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </span>
            Edit Course
          </h1>
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-outline bg-white hover:bg-gray-50">
            Cancel Editing
          </button>
        </div>
        <CourseForm initialData={course} />
      </div>
    );
  }

  return (
    <div className="pb-12 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-secondary-50 rounded-full blur-3xl opacity-70"></div>
      </div>

      {/* Header section with background */}
      <div className="bg-gradient-to-r from-primary-600/90 to-primary-700/90 mb-10 -mx-6 px-6 py-10 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white m-0 tracking-tight">
              {course.title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="btn bg-white text-primary-600 hover:bg-primary-50 shadow-md">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Course
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
              {course.category === "mental_health"
                ? "Mental Health"
                : course.category === "obesity"
                ? "Obesity"
                : "Other"}
            </span>
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}{" "}
              Level
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                course.isPublished
                  ? "bg-green-500/90 text-white"
                  : "bg-gray-500/80 text-white"
              }`}>
              {course.isPublished ? "Published" : "Draft"}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                course.isApproved
                  ? "bg-blue-500/90 text-white"
                  : "bg-amber-500/90 text-white"
              }`}>
              {course.isApproved ? "Approved" : "Pending Approval"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transform transition-all hover:shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                <svg
                  className="h-6 w-6 text-primary-600 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Course Description
              </h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                <p>{course.description}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl shadow-lg overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-primary-400 to-secondary-400"></div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <svg
                    className="h-6 w-6 text-primary-600 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Quick Actions
                </h2>
                <div className="space-y-4">
                  <Link
                    href={`/instructor/courses/${courseId}/modules/create`}
                    className="btn btn-primary w-full group">
                    <svg
                      className="h-5 w-5 mr-2 group-hover:animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Module
                  </Link>
                  {/* Add Course Tests Button */}
                  <Link
                    href={`/instructor/courses/${courseId}/tests`}
                    className="btn bg-white text-gray-700 border border-gray-200 hover:border-secondary-200 hover:bg-secondary-50 w-full group">
                    <svg
                      className="h-5 w-5 mr-2 text-secondary-600 group-hover:animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Manage Tests
                  </Link>

                  <Link
                    href={`/instructor/analytics/${courseId}`}
                    className="btn bg-white text-gray-700 border border-gray-200 hover:border-primary-200 hover:bg-primary-50 w-full group">
                    <svg
                      className="h-5 w-5 mr-2 text-primary-600 group-hover:animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Tests Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg
                className="h-6 w-6 text-secondary-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Course Assessments
            </h2>
            <Link
              href={`/instructor/courses/${courseId}/tests`}
              className="btn btn-secondary">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Manage Tests
            </Link>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            {course.preTestQuizId && course.postTestQuizId ? (
              <div className="flex justify-between items-center">
                <div>
                  <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 mb-2">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Tests Configured
                  </span>
                  <h3 className="font-medium text-gray-900">
                    Pre-test and post-test are set up for this course.
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {course.requirePreTest
                      ? "Students must complete the pre-test before accessing course content."
                      : "Students can access course content without completing the pre-test."}
                  </p>
                </div>
                <Link
                  href={`/instructor/courses/${courseId}/tests/edit`}
                  className="btn bg-gray-100 hover:bg-white text-gray-700 border border-gray-300">
                  Edit Tests
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 mb-2">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    No Tests Configured
                  </span>
                  <h3 className="font-medium text-gray-900">
                    Pre-test and post-test are not set up yet
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Adding pre and post tests helps measure student learning
                    progress
                  </p>
                </div>
                <Link
                  href={`/instructor/courses/${courseId}/tests/create`}
                  className="btn btn-secondary mt-4 sm:mt-0">
                  Create Tests
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Modules section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg
                className="h-6 w-6 text-primary-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Course Modules
            </h2>
            <Link
              href={`/instructor/courses/${courseId}/modules/create`}
              className="btn btn-primary">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Module
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <svg
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No modules yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add your first module to get started building your course
                content!
              </p>
              <Link
                href={`/instructor/courses/${courseId}/modules/create`}
                className="btn btn-primary inline-flex">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create First Module
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="group relative border border-gray-200 hover:border-primary-300 rounded-xl p-5 transition-all duration-200 hover:shadow-md bg-white">
                  <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 text-primary-700 h-10 w-10 rounded-full flex items-center justify-center font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm text-primary-600 font-medium">
                          Module {index + 1}
                        </span>
                        <h3 className="text-lg font-medium text-gray-900 mb-0">
                          {module.title}
                        </h3>
                      </div>
                    </div>
                    <Link
                      href={`/instructor/courses/${courseId}/modules/${module.id}`}
                      className="btn bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-600 border border-gray-200 hover:border-primary-300 sm:self-end">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
