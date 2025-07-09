'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../../lib/context/LanguageContext';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  PlayCircle, 
  CheckCircle2,
  Calendar,
  ArrowRight
} from 'lucide-react';

export default function MyCourses() {
  const { currentLanguage } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inProgress');
  const [t, setT] = useState({});
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHours: 0,
    averageProgress: 0
  });

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../../../../locales/${currentLanguage}/learner/myCourses.json`);
        setT(translations.default);
      } catch (error) {
        console.error('Error loading my courses translations:', error);
        // Fallback to English if translation fails
        const fallback = await import('../../../../locales/en/learner/myCourses.json');
        setT(fallback.default);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/learner/enrollments');
        setCourses(data.data);
        
        // Calculate statistics
        const totalCourses = data.data.length;
        const completedCourses = data.data.filter(c => c.progress === 100).length;
        const inProgressCourses = data.data.filter(c => c.progress > 0 && c.progress < 100).length;
        const averageProgress = totalCourses > 0 
          ? Math.round(data.data.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
          : 0;
        
        // Calculate total hours from course durations
        const totalHours = data.data.reduce((sum, enrollment) => {
          const duration = enrollment.Course?.duration || 0;
          return sum + Math.floor(duration / 60); // Convert minutes to hours
        }, 0);
        
        setStats({
          totalCourses,
          completedCourses,
          inProgressCourses,
          averageProgress,
          totalHours
        });
      } catch (err) {
        setError(t.error?.title || 'Failed to load your courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (Object.keys(t).length > 0) {
      fetchMyCourses();
    }
  }, [t]);

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'inProgress') {
      return course.progress > 0 && course.progress < 100;
    } else if (activeTab === 'completed') {
      return course.progress === 100;
    } else if (activeTab === 'notStarted') {
      return course.progress === 0;
    }
    return true;
  });

  const getProgressColor = (progress) => {
    if (progress === 100) return 'from-emerald-500 to-teal-600';
    if (progress >= 70) return 'from-blue-500 to-indigo-600';
    if (progress >= 30) return 'from-amber-500 to-orange-600';
    return 'from-rose-500 to-pink-600';
  };

  const getProgressBgColor = (progress) => {
    if (progress === 100) return 'bg-emerald-50 border-emerald-200';
    if (progress >= 70) return 'bg-blue-50 border-blue-200';
    if (progress >= 30) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return t.dates?.notStarted || 'Not started yet';
    
    const locale = currentLanguage === 'id' ? 'id-ID' : 'en-US';
    const options = currentLanguage === 'id' 
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };
    
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  const getCategoryLabel = (category) => {
    return t.categories?.[category] || category;
  };

  // Helper function to generate thumbnail URL
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    // Check if it's already a full URL
    if (thumbnail.startsWith('http')) return thumbnail;
    // Construct the full URL using the backend server
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/thumbnails/${thumbnail}`;
  };

  // Return loading state if translations aren't loaded yet
  if (!t.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-primary-500 rounded-full animate-spin animate-reverse"></div>
            </div>
            <p className="mt-6 text-xl font-semibold text-gray-700">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-primary-500 rounded-full animate-spin animate-reverse"></div>
            </div>
            <p className="mt-6 text-xl font-semibold text-gray-700">{t.loading?.text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-red-800">{t.error?.title}</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors font-medium"
                >
                  {t.error?.tryAgain}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-700 rounded-3xl shadow-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-10 -left-20 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          </div>
          
          <div className="relative z-10 px-8 py-16">
            <div className="flex flex-col lg:flex-row items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {t.header?.title}
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl leading-relaxed">
                  {t.header?.subtitle}
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-8 lg:mt-0 grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{stats.totalCourses}</div>
                  <div className="text-blue-200 text-sm">{t.quickStats?.totalCourses}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{stats.averageProgress}%</div>
                  <div className="text-blue-200 text-sm">{t.quickStats?.averageProgress}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t.statsCards?.completedCourses}</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.completedCourses}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t.statsCards?.currentlyLearning}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgressCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t.statsCards?.learningHours}</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalHours}{t.courseCard?.duration?.hours}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t.statsCards?.averageProgress}</p>
                <p className="text-3xl font-bold text-orange-600">{stats.averageProgress}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200">
            {[
              { key: 'all', label: t.tabs?.allCourses, icon: BookOpen },
              { key: 'inProgress', label: t.tabs?.inProgress, icon: PlayCircle },
              { key: 'completed', label: t.tabs?.completed, icon: CheckCircle2 },
              { key: 'notStarted', label: t.tabs?.notStarted, icon: Clock }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Progress Timeline */}
        {filteredCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.progressSection?.title}</h2>
                <p className="text-gray-600">{t.progressSection?.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary-600">{stats.completedCourses}</div>
                <div className="text-gray-500 text-sm">{t.progressSection?.from} {stats.totalCourses} {t.progressSection?.coursesCompleted}</div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">0%</span>
                <span className="text-sm font-medium text-gray-600">100%</span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                />
              </div>
              <div className="mt-2 text-center">
                <span className="text-sm text-gray-600">
                  {stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0}% {t.progressSection?.coursesCompleted}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Course Grid */}
        <AnimatePresence mode="wait">
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-blue-500" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {activeTab === 'completed' ? t.emptyStates?.completed?.title :
                   activeTab === 'inProgress' ? t.emptyStates?.inProgress?.title :
                   activeTab === 'notStarted' ? t.emptyStates?.notStarted?.title :
                   t.emptyStates?.all?.title}
                </h3>
                
                <p className="text-gray-600 mb-8">
                  {activeTab === 'completed' ? t.emptyStates?.completed?.message :
                   activeTab === 'inProgress' ? t.emptyStates?.inProgress?.message :
                   activeTab === 'notStarted' ? t.emptyStates?.notStarted?.message :
                   t.emptyStates?.all?.message}
                </p>
                
                <Link
                  href="/learner/courses"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <span>{t.emptyStates?.button}</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCourses.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Progress indicator line */}
                  <div className={`h-1 w-full bg-gradient-to-r ${getProgressColor(enrollment.progress)}`} />
                  
                  {/* Course thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    {enrollment.Course?.thumbnail ? (
                      <img
                        src={getThumbnailUrl(enrollment.Course.thumbnail)}
                        alt={enrollment.Course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback when no thumbnail or image fails to load */}
                    <div 
                      className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                      style={{ display: enrollment.Course?.thumbnail ? 'none' : 'flex' }}
                    >
                      <BookOpen className="h-16 w-16 text-gray-400" />
                    </div>
                    
                    {/* Progress badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${getProgressBgColor(enrollment.progress)} border`}>
                        {enrollment.progress}% {t.courseCard?.completed}
                      </div>
                    </div>
                    
                    {/* Completion badge */}
                    {enrollment.progress === 100 && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-emerald-500 text-white p-2 rounded-full">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Course content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {getCategoryLabel(enrollment.Course?.category)}
                      </span>
                      {enrollment.Course?.duration && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(enrollment.Course.duration / 60)}{t.courseCard?.duration?.hours} {enrollment.Course.duration % 60}{t.courseCard?.duration?.minutes}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                      {enrollment.Course?.title || 'Kursus Tanpa Judul'}
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">{t.courseCard?.progress}</span>
                          <span className="text-sm font-bold text-gray-900">{enrollment.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${enrollment.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${getProgressColor(enrollment.progress)} rounded-full`}
                          />
                        </div>
                      </div>
                      
                      {/* Last activity */}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {enrollment.progress === 100
                            ? `${t.courseCard?.completedOn} ${formatDate(enrollment.completedAt)}`
                            : enrollment.lastAccessedAt
                              ? `${t.courseCard?.lastActive} ${formatDate(enrollment.lastAccessedAt)}`
                              : t.courseCard?.notStarted
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Action button */}
                    <Link
                      href={`/learner/courses/${enrollment.Course?.id || enrollment.courseId}`}
                      className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        enrollment.progress === 100
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : enrollment.progress > 0
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      } group-hover:shadow-lg`}
                    >
                      {enrollment.progress === 100 ? (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          <span>{t.courseCard?.actions?.viewCertificate}</span>
                        </>
                      ) : enrollment.progress > 0 ? (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          <span>{t.courseCard?.actions?.continueLearning}</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span>{t.courseCard?.actions?.startLearning}</span>
                        </>
                      )}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl p-8 text-center text-white shadow-2xl"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{t.callToAction?.title}</h2>
            <p className="text-xl text-blue-100 mb-8">
              {t.callToAction?.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/learner/courses"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                <span>{t.callToAction?.exploreCourses}</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                href="/learner/achievements"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Award className="h-5 w-5 mr-2" />
                <span>{t.callToAction?.viewAchievements}</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}