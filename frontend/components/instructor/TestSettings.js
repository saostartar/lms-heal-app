'use client';

import { useState, useEffect } from 'react';
import axios from '../../lib/axios';

export default function TestSettings({ courseId, onUpdated }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    requirePreTest: false,
    preTestQuizId: null,
    postTestQuizId: null
  });
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch course test settings
        const { data: courseData } = await axios.get(`/api/courses/${courseId}/tests`);
        setSettings({
          requirePreTest: courseData.data.requirePreTest,
          preTestQuizId: courseData.data.preTestQuiz?.id || null,
          postTestQuizId: courseData.data.postTestQuiz?.id || null
        });
        
        // Fetch available quizzes for this course
        const { data: moduleData } = await axios.get(`/api/modules/course/${courseId}`);
        const moduleIds = moduleData.data.map(module => module.id);
        
        // Fetch quizzes for these modules
        let availableQuizzes = [];
        for (const moduleId of moduleIds) {
          const { data: quizData } = await axios.get(`/api/quizzes/module/${moduleId}`);
          availableQuizzes = [...availableQuizzes, ...quizData.data];
        }
        
        setQuizzes(availableQuizzes);
        
      } catch (err) {
        setError('Failed to load test settings: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/api/courses/${courseId}/tests`, settings);
      onUpdated && onUpdated();
    } catch (err) {
      setError('Failed to update test settings: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrePostTests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/courses/${courseId}/tests`, {
        createPrePostTest: true,
        testTitle: `${courseId} Assessment`,
        testDescription: 'This test assesses your knowledge of the course material'
      });
      
      setSettings({
        requirePreTest: true,
        preTestQuizId: data.data.preTestQuizId,
        postTestQuizId: data.data.postTestQuizId
      });
      
      onUpdated && onUpdated();
    } catch (err) {
      setError('Failed to create tests: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse p-4">Loading test settings...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Course Test Settings</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="requirePreTest"
            name="requirePreTest"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={settings.requirePreTest}
            onChange={handleChange}
          />
          <label htmlFor="requirePreTest" className="ml-2 block text-sm text-gray-700">
            Require pre-test completion before accessing course content
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="preTestQuizId" className="block text-sm font-medium text-gray-700 mb-1">
              Pre-Test Quiz
            </label>
            <select
              id="preTestQuizId"
              name="preTestQuizId"
              className="form-input w-full"
              value={settings.preTestQuizId || ''}
              onChange={handleChange}
            >
              <option value="">None</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="postTestQuizId" className="block text-sm font-medium text-gray-700 mb-1">
              Post-Test Quiz
            </label>
            <select
              id="postTestQuizId"
              name="postTestQuizId"
              className="form-input w-full"
              value={settings.postTestQuizId || ''}
              onChange={handleChange}
            >
              <option value="">None</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          {!settings.preTestQuizId && !settings.postTestQuizId && (
            <button
              type="button"
              onClick={handleCreatePrePostTests}
              className="btn btn-outline"
              disabled={loading}
            >
              Create Pre/Post Tests
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}