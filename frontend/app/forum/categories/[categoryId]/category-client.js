'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useAuth } from '@/lib/context/auth-context';
import { useLanguage } from '@/lib/context/LanguageContext';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { formatDate, formatRelativeTime } from '@/lib/utils/dateUtils';

// Terima data awal sebagai props
export default function CategoryClient({ initialCategory, initialTopics, initialError, params }) {
  const { categoryId } = params;
  const { isAuthenticated } = useAuth();
  const { currentLanguage } = useLanguage();
  const router = useRouter();
  
  // Inisialisasi state dari props
  const [category, setCategory] = useState(initialCategory);
  const [topics, setTopics] = useState(initialTopics || []);
  const [loading, setLoading] = useState(!initialCategory && !initialError);
  const [error, setError] = useState(initialError);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [t, setT] = useState({});

  // Load translations (tetap di client karena butuh context)
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../../../../locales/${currentLanguage}/forumCategory.json`);
        setT(translations.default);
      } catch (error) {
        console.error('Error loading forum category translations:', error);
        const fallback = await import('../../../../locales/en/forumCategory.json');
        setT(fallback.default);
      }
    };
    loadTranslations();
  }, [currentLanguage]);

  // useEffect untuk fetchCategory sudah tidak diperlukan, data sudah ada dari server.
  // Set loading to false once translations are loaded and initial data is present.
  useEffect(() => {
    if (Object.keys(t).length > 0) {
      setLoading(false);
    }
  }, [t]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/forum/categories/${categoryId}`));
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(`/api/forum/categories/${categoryId}/topics`, formData);
      setTopics([data.data, ...topics]);
      setFormData({ title: '', content: '' });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create topic:', err);
      setError(t.error?.failedToCreate || 'Failed to create topic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Return loading state if translations aren't loaded yet
  if (!t.navigation) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-md mb-6">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-red-800">{error || t.error.categoryNotFound}</span>
            </div>
          </div>
          <Link href="/forum" className="btn btn-outline inline-flex">
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.navigation.backToForums}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero section with gradient background */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="bg-white/5 p-8">
            <div className="max-w-3xl">
              <Link href="/forum" 
                className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-all group">
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
                  fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
                </svg>
                {t.navigation.backToForums}
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{category.title}</h1>
              <p className="text-white/80 text-lg">{category.description}</p>
            </div>
          </div>
        </div>

        {/* Discussion section with card design */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100/60">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">{t.discussions.title}</h2>
            {isAuthenticated ? (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn btn-primary w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showCreateForm ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
                {showCreateForm ? t.discussions.cancel : t.discussions.startDiscussion}
              </button>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(`/forum/categories/${categoryId}`)}`}
                className="btn btn-primary w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t.discussions.loginToStart}
              </Link>
            )}
          </div>

          {/* Create discussion form */}
          {showCreateForm && (
            <div className="bg-gray-50 border border-primary-100 rounded-lg p-6 mb-8 shadow-inner">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.createForm.title}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.createForm.titleLabel}
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-input w-full"
                    placeholder={t.createForm.titlePlaceholder}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.createForm.contentLabel}
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="form-input w-full"
                    placeholder={t.createForm.contentPlaceholder}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.createForm.creating}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {t.createForm.createButton}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Topics list */}
          {topics.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-100">
              <div className="flex flex-col items-center justify-center py-6">
                <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p className="text-gray-500 text-lg mb-2">{t.emptyState.noDiscussions}</p>
                <p className="text-primary-600 font-medium text-lg">{t.emptyState.beFirst}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="card card-hover group transition-all border-l-4 border-transparent hover:border-primary-400">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-grow">
                      <Link 
                        href={`/forum/topics/${topic.id}`}
                        className="text-xl font-medium text-gray-800 hover:text-primary-600 transition-colors group-hover:text-primary-600 flex items-center"
                      >
                        {topic.title}
                        <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </Link>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                          </svg>
                          {topic.author?.name || 'Unknown'}
                        </span>
                        <span className="mx-2">&bull;</span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                          </svg>
                          {formatDate(topic.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-3 md:gap-1 md:text-right text-sm">
                      <div className="badge badge-primary">
                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                        </svg>
                        {topic.viewCount} {t.topicStats.views}
                      </div>
                      <div className="badge badge-secondary">
                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"></path>
                        </svg>
                        {(topic.ForumPosts?.length || 0) + 1} {t.topicStats.replies}
                      </div>
                      <div className="flex items-center md:justify-end text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                        </svg>
                        {t.topicStats.lastReply} {formatRelativeTime(topic.lastActivityAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}