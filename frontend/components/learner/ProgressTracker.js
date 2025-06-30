import { useState, useEffect } from 'react';
import axios from '../../lib/axios';

export default function ProgressTracker({ courseId, moduleId, lessonId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/learner/progress/course/${courseId}`);
        setProgress(data.data);
      } catch (err) {
        setError('Failed to load progress data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchProgress();
    }
  }, [courseId, moduleId, lessonId]);

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

  return (
    <div className="progress-tracker">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Course Progress</span>
        <span>{progress.overallProgress}%</span>
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-500 rounded-full h-2" 
          style={{ width: `${progress.overallProgress}%` }}
        ></div>
      </div>
      
      {moduleId && progress.moduleProgress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Module Progress</span>
            <span>{progress.moduleProgress[moduleId] || 0}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-secondary-500 rounded-full h-2" 
              style={{ width: `${progress.moduleProgress[moduleId] || 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}