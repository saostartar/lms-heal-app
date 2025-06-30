'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../../lib/axios';

export default function ModuleForm({ courseId, initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    position: initialData?.position || 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'position' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        // Update existing module
        await axios.put(`/api/modules/${initialData.id}`, formData);
        router.push(`/instructor/courses/${courseId}/modules/${initialData.id}`);
      } else {
        // Create new module
        const { data } = await axios.post(`/api/modules/course/${courseId}`, formData);
        router.push(`/instructor/courses/${courseId}/modules/${data.data.id}`);
      }
    } catch (err) {
      setError('Failed to save module: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transform transition-all duration-500 hover:shadow-xl">
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
          <h3 className="text-xl font-bold flex items-center text-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            {initialData ? 'Update Module' : 'Create New Module'}
          </h3>
          <p className="text-primary-100 text-sm mt-1">Fill in the details to organize your course content</p>
        </div>
        
        {/* Form Content */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Module Title */}
          <div className="group transition-all duration-300 hover:translate-x-1">
            <label htmlFor="title" className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Module Title <span className="text-primary-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="text-black form-input w-full bg-white focus:ring-2 focus:ring-primary-300 border-transparent shadow-md group-hover:shadow-lg transition-all"
              placeholder="Enter a descriptive title for your module"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="group transition-all duration-300 hover:translate-x-1">
            <label htmlFor="description" className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="text-black form-input w-full bg-white focus:ring-2 focus:ring-primary-300 border-transparent shadow-md group-hover:shadow-lg transition-all"
              placeholder="Provide a detailed description of what this module will cover"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Position */}
          <div className="group transition-all duration-300 hover:translate-x-1">
            <label htmlFor="position" className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Position (Order)
            </label>
            <input
              type="number"
              id="position"
              name="position"
              min="0"
              className="text-black form-input w-full bg-white focus:ring-2 focus:ring-primary-300 border-transparent shadow-md group-hover:shadow-lg transition-all"
              value={formData.position}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1 italic">
              Determines the order of modules in the course. Lower numbers come first.
            </p>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="px-8 py-4 bg-gray-50 flex justify-end space-x-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline group"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary group relative overflow-hidden"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <span className="relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  {initialData ? 'Update Module' : 'Create Module'}
                </span>
                <span className="absolute inset-0 h-full w-0 bg-white bg-opacity-20 transform -skew-x-12 group-hover:w-full transition-all duration-500"></span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}