'use client'

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from '../../../../../lib/axios';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function QuizAnalyticsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizAnalytics, setQuizAnalytics] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Fetch all quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/quizzes');
        setQuizzes(data.data);
        
        // Fetch analytics for each quiz
        const analyticsPromises = data.data.map(quiz => 
          axios.get(`/api/analytics/quizzes/${quiz.id}`)
            .then(response => ({
              quizId: quiz.id,
              data: response.data.data
            }))
            .catch(error => ({
              quizId: quiz.id,
              data: {
                totalAttempts: 0,
                uniqueStudents: 0,
                averageScore: 0,
                passRate: 0
              }
            }))
        );
        
        const analyticsResults = await Promise.all(analyticsPromises);
        const analyticsMap = {};
        analyticsResults.forEach(result => {
          analyticsMap[result.quizId] = result.data;
        });
        
        setQuizAnalytics(analyticsMap);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Filter quizzes based on selected filter
  const filteredQuizzes = useMemo(() => {
    let filtered = [...quizzes];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(term) || 
        (quiz.description && quiz.description.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'module':
        filtered = filtered.filter(quiz => quiz.moduleId !== null);
        break;
      case 'course':
        filtered = filtered.filter(quiz => quiz.courseId !== null);
        break;
      case 'preTest':
        filtered = filtered.filter(quiz => quiz.isPreTest === true);
        break;
      case 'postTest':
        filtered = filtered.filter(quiz => quiz.isPostTest === true);
        break;
      case 'published':
        filtered = filtered.filter(quiz => quiz.status === 'published');
        break;
      case 'draft':
        filtered = filtered.filter(quiz => quiz.status === 'draft');
        break;
      default:
        // 'all' - no filtering needed
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'attempts':
          aValue = quizAnalytics[a.id]?.totalAttempts || 0;
          bValue = quizAnalytics[b.id]?.totalAttempts || 0;
          break;
        case 'students':
          aValue = quizAnalytics[a.id]?.uniqueStudents || 0;
          bValue = quizAnalytics[b.id]?.uniqueStudents || 0;
          break;
        case 'avgScore':
          aValue = quizAnalytics[a.id]?.averageScore || 0;
          bValue = quizAnalytics[b.id]?.averageScore || 0;
          break;
        case 'passRate':
          aValue = quizAnalytics[a.id]?.passRate || 0;
          bValue = quizAnalytics[b.id]?.passRate || 0;
          break;
        default:
          // Default sort by title
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [quizzes, searchTerm, selectedFilter, sortBy, sortOrder, quizAnalytics]);

  // Calculate summary stats for charts
  const summaryStats = useMemo(() => {
    if (!quizzes.length) return null;
    
    const stats = {
      totalAttempts: 0,
      totalPassedAttempts: 0,
      totalStudents: new Set(),
      avgScoreSum: 0,
      avgScoreCount: 0,
      quizTypes: {
        module: 0,
        course: 0,
        preTest: 0,
        postTest: 0
      },
      quizStatus: {
        published: 0,
        draft: 0
      },
      topQuizzes: []
    };
    
    quizzes.forEach(quiz => {
      // Quiz type counts
      if (quiz.moduleId) stats.quizTypes.module++;
      if (quiz.courseId) stats.quizTypes.course++;
      if (quiz.isPreTest) stats.quizTypes.preTest++;
      if (quiz.isPostTest) stats.quizTypes.postTest++;
      
      // Status counts
      if (quiz.status === 'published') {
        stats.quizStatus.published++;
      } else {
        stats.quizStatus.draft++;
      }
      
      // Analytics data
      const analytics = quizAnalytics[quiz.id];
      if (analytics) {
        stats.totalAttempts += analytics.totalAttempts || 0;
        stats.totalPassedAttempts += Math.round(((analytics.passRate || 0) / 100) * (analytics.totalAttempts || 0));
        
        if (analytics.uniqueStudents) {
          // This is a simple approximation since we can't really get unique students across quizzes from this data structure
          stats.totalStudents.add(analytics.uniqueStudents);
        }
        
        if (analytics.averageScore) {
          stats.avgScoreSum += analytics.averageScore;
          stats.avgScoreCount++;
        }
      }
    });
    
    // Sort quizzes by attempts for top quizzes
    const sortedQuizzes = [...quizzes].sort((a, b) => {
      const aAttempts = quizAnalytics[a.id]?.totalAttempts || 0;
      const bAttempts = quizAnalytics[b.id]?.totalAttempts || 0;
      return bAttempts - aAttempts;
    });
    
    stats.topQuizzes = sortedQuizzes.slice(0, 5).map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      attempts: quizAnalytics[quiz.id]?.totalAttempts || 0
    }));
    
    return stats;
  }, [quizzes, quizAnalytics]);

  // Prepare chart data
  const typeChartData = useMemo(() => {
    if (!summaryStats) return null;
    
    return {
      labels: ['Module Quizzes', 'Course Quizzes', 'Pre-Tests', 'Post-Tests'],
      datasets: [
        {
          data: [
            summaryStats.quizTypes.module,
            summaryStats.quizTypes.course,
            summaryStats.quizTypes.preTest,
            summaryStats.quizTypes.postTest
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  }, [summaryStats]);

  const statusChartData = useMemo(() => {
    if (!summaryStats) return null;
    
    return {
      labels: ['Published', 'Draft'],
      datasets: [
        {
          data: [
            summaryStats.quizStatus.published,
            summaryStats.quizStatus.draft
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  }, [summaryStats]);

  const topQuizzesChartData = useMemo(() => {
    if (!summaryStats || !summaryStats.topQuizzes.length) return null;
    
    return {
      labels: summaryStats.topQuizzes.map(quiz => {
        // Truncate long titles
        return quiz.title.length > 20 ? quiz.title.substring(0, 20) + '...' : quiz.title;
      }),
      datasets: [
        {
          label: 'Number of Attempts',
          data: summaryStats.topQuizzes.map(quiz => quiz.attempts),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  }, [summaryStats]);

  // Render functions for different parts of the UI
  const renderSummaryStats = () => {
    if (!summaryStats) return null;
    
    const avgScore = summaryStats.avgScoreCount > 0 
      ? (summaryStats.avgScoreSum / summaryStats.avgScoreCount).toFixed(2) 
      : 'N/A';
    
    const passRate = summaryStats.totalAttempts > 0 
      ? ((summaryStats.totalPassedAttempts / summaryStats.totalAttempts) * 100).toFixed(2) 
      : 'N/A';
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Quizzes</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">{quizzes.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Attempts</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">{summaryStats.totalAttempts}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Score</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">{avgScore}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Pass Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">{passRate}%</p>
        </div>
      </div>
    );
  };
  
  const renderCharts = () => {
    if (!typeChartData || !statusChartData) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quiz Types</h3>
          <div className="h-64">
            <Pie data={typeChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quiz Status</h3>
          <div className="h-64">
            <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Quizzes by Attempts</h3>
          {topQuizzesChartData ? (
            <div className="h-64">
              <Bar 
                data={topQuizzesChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No quiz attempt data available
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderQuizTable = () => {
    if (!filteredQuizzes.length) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No quizzes found matching your criteria.</p>
        </div>
      );
    }
    
    const handleSort = (column) => {
      if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(column);
        setSortOrder('asc');
      }
    };
    
    const renderSortIcon = (column) => {
      if (sortBy !== column) return null;
      return sortOrder === 'asc' ? ' ▲' : ' ▼';
    };
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Quiz Title{renderSortIcon('title')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('attempts')}
                >
                  Attempts{renderSortIcon('attempts')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('students')}
                >
                  Students{renderSortIcon('students')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('avgScore')}
                >
                  Avg. Score{renderSortIcon('avgScore')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('passRate')}
                >
                  Pass Rate{renderSortIcon('passRate')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuizzes.map(quiz => {
                const analytics = quizAnalytics[quiz.id] || {
                  totalAttempts: 0,
                  uniqueStudents: 0,
                  averageScore: 0,
                  passRate: 0
                };
                
                let quizType = 'Standard';
                if (quiz.isPreTest) quizType = 'Pre-Test';
                else if (quiz.isPostTest) quizType = 'Post-Test';
                else if (quiz.courseId) quizType = 'Course Quiz';
                else if (quiz.moduleId) quizType = 'Module Quiz';
                
                return (
                  <tr key={quiz.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{quizType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        quiz.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quiz.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analytics.totalAttempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analytics.uniqueStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analytics.averageScore ? `${analytics.averageScore.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analytics.passRate ? `${analytics.passRate.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/instructor/analytics/quizzes/${quiz.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Quiz Analytics Overview</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input rounded-md shadow-sm"
          />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="form-select rounded-md shadow-sm"
          >
            <option value="all">All Quizzes</option>
            <option value="module">Module Quizzes</option>
            <option value="course">Course Quizzes</option>
            <option value="preTest">Pre-Tests</option>
            <option value="postTest">Post-Tests</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {renderSummaryStats()}
      {renderCharts()}
      
      <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
      {renderQuizTable()}
    </div>
  );
}