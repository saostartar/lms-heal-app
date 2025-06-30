'use client';

import { useState, useEffect } from 'react';
import axios from '../../lib/axios';

export default function TestComparison({ courseId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First check if pre-test and post-test are completed
        const { data: statusData } = await axios.get(`/api/analytics/course/${courseId}/access-status`);
        setAccessStatus(statusData);
        
        if (statusData.preTestCompleted && statusData.postTestCompleted) {
          // If both are completed, fetch comparison data
          const { data: comparisonData } = await axios.get(`/api/analytics/course/${courseId}/test-comparison`);
          setComparison(comparisonData.data);
        }
      } catch (err) {
        setError('Failed to load test comparison: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-2 text-sm">{error}</div>;
  }

  // If pre-test is not required or not available, don't show anything
  if (!accessStatus?.preTestRequired || !accessStatus?.postTestAvailable) {
    return null;
  }

  // If pre-test or post-test are not completed yet, show appropriate message
  if (!accessStatus.preTestCompleted || !accessStatus.postTestCompleted) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Knowledge Assessment</h3>
        {!accessStatus.preTestCompleted ? (
          <p className="text-gray-600">
            Please complete the pre-test to establish your baseline knowledge.
          </p>
        ) : (
          <p className="text-gray-600">
            You've completed the pre-test. After finishing the course, take the post-test to see how much you've learned!
          </p>
        )}
      </div>
    );
  }

  // If both tests are completed, show comparison
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Your Learning Progress</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-sm">Pre-Test Score</div>
          <div className="text-lg font-semibold">{comparison.preTest.score.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-sm">Post-Test Score</div>
          <div className="text-lg font-semibold">{comparison.postTest.score.toFixed(1)}%</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Knowledge Improvement</div>
        <div className="text-xl font-bold">
          {comparison.comparison.improvement > 0 ? (
            <span className="text-green-600">+{comparison.comparison.improvement.toFixed(1)}%</span>
          ) : comparison.comparison.improvement < 0 ? (
            <span className="text-red-600">{comparison.comparison.improvement.toFixed(1)}%</span>
          ) : (
            <span>No change</span>
          )}
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
          <div 
            className={`h-full rounded-full ${comparison.comparison.improvement > 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.max(comparison.comparison.improvementPercentage, 0), 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}