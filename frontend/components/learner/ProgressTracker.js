import { useState, useEffect } from 'react';
import axios from '../../lib/axios';

export default function ProgressTracker({ courseId, moduleId, lessonId, onProgressUpdate }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/progress/course/${courseId}`);
      setProgress(data.data);
      
      // Notify parent component of progress update
      if (onProgressUpdate) {
        onProgressUpdate(data.data);
      }
      
      console.log('Progress tracker data:', data.data);
    } catch (err) {
      setError('Failed to load progress data');
      console.error('Progress tracker error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchProgress();
    }
  }, [courseId, moduleId, lessonId]);

  // Expose refresh function
  useEffect(() => {
    window.refreshProgress = fetchProgress;
  }, []);

  if (loading) {
    return (
      <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  if (error || !progress) {
    return (
      <div className="h-2 bg-gray-200 rounded-full"></div>
    );
  }

  const overallProgress = progress.overallProgress || 0;
  
  // Get current module progress
  const getCurrentModuleProgress = () => {
    if (!moduleId || !progress.course?.modules) return 0;
    const module = progress.course.modules.find(m => m.id === parseInt(moduleId));
    return module?.moduleProgress?.progress || 0;
  };

  return (
    <div className="progress-tracker space-y-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Course Progress</span>
        <span>{Math.round(overallProgress)}%</span>
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-500 rounded-full h-2 transition-all duration-500 ease-out" 
          style={{ width: `${overallProgress}%` }}
        ></div>
      </div>
      
      {moduleId && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Module Progress</span>
            <span>{Math.round(getCurrentModuleProgress())}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-secondary-500 rounded-full h-2 transition-all duration-500 ease-out" 
              style={{ width: `${getCurrentModuleProgress()}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {progress.isCompleted && (
        <div className="flex items-center justify-center text-green-600 text-sm font-medium mt-2">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Course Completed!
        </div>
      )}
    </div>
  );
}