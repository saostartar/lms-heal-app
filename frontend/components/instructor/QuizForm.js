'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../../lib/axios';

export default function QuizForm({ courseId, moduleId, initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    passingScore: initialData?.passingScore || 60,
    timeLimit: initialData?.timeLimit || null,
    maxAttempts: initialData?.maxAttempts || null,
    instructions: initialData?.instructions || '',
    shuffleQuestions: initialData?.shuffleQuestions || false,
    allowReview: initialData?.allowReview ?? true,
    status: initialData?.status || 'draft'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : (type === 'number' && value !== '' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        // Update existing quiz
        await axios.put(`/api/quizzes/${initialData.id}`, formData);
      } else {
        // Create new quiz
        const { data } = await axios.post('/api/quizzes', {
          ...formData,
          moduleId
        });
        router.push(`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${data.data.id}`);
        return; // Early return since we're redirecting
      }
      
      router.push(`/instructor/courses/${courseId}/modules/${moduleId}`);
    } catch (err) {
      setError('Failed to save quiz: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8">
      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
          <svg className="h-6 w-6 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left column - basic info */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-50 to-white p-4 rounded-lg border-l-4 border-primary-500">
              <h2 className="text-xl font-semibold text-primary-700 mb-1">Quiz Information</h2>
              <p className="text-sm text-gray-500">Define the core elements of your assessment</p>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title <span className="text-primary-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="text-black form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-colors"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Module Final Assessment"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="text-black form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-colors"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of what this quiz covers"
              ></textarea>
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions for Students
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={4}
                className="text-black form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-colors"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Provide clear instructions for students taking this quiz"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right column - settings */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-secondary-50 to-white p-4 rounded-lg border-l-4 border-secondary-500">
              <h2 className="text-xl font-semibold text-secondary-700 mb-1">Quiz Settings</h2>
              <p className="text-sm text-gray-500">Configure assessment parameters and behavior</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:border-primary-200">
                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="passingScore"
                    name="passingScore"
                    min="0"
                    max="100"
                    className="text-black form-input w-full pr-8 rounded-lg border-gray-300"
                    value={formData.passingScore}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:border-primary-200">
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    min="1"
                    className="text-black form-input w-full pr-16 rounded-lg border-gray-300"
                    value={formData.timeLimit || ''}
                    onChange={handleChange}
                    placeholder="No limit"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">minutes</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:border-primary-200">
                <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attempts
                </label>
                <input
                  type="number"
                  id="maxAttempts"
                  name="maxAttempts"
                  min="1"
                  className="text-black form-input w-full rounded-lg border-gray-300"
                  value={formData.maxAttempts || ''}
                  onChange={handleChange}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-4">Additional Options</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-md p-1.5 mr-3">
                    <input
                      type="checkbox"
                      id="shuffleQuestions"
                      name="shuffleQuestions"
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={formData.shuffleQuestions}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="shuffleQuestions" className="font-medium text-sm text-gray-700">
                      Shuffle questions
                    </label>
                    <p className="text-xs text-gray-500">Questions will appear in random order for each attempt</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-md p-1.5 mr-3">
                    <input
                      type="checkbox"
                      id="allowReview"
                      name="allowReview"
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={formData.allowReview}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="allowReview" className="font-medium text-sm text-gray-700">
                      Allow answer review
                    </label>
                    <p className="text-xs text-gray-500">Students can review their answers after submission</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:border-primary-200">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  className=" text-black form-input w-full appearance-none rounded-lg border-gray-300 pl-4 pr-10 py-2"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft (not visible to students)</option>
                  <option value="published">Published (visible to students)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100">
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>{initialData ? 'Update Quiz' : 'Create Quiz'}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}