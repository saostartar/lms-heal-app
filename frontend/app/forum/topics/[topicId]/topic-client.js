'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useAuth } from '@/lib/context/auth-context';
import { useLanguage } from '@/lib/context/LanguageContext';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { formatDate } from '@/lib/utils/dateUtils';

// Terima data awal sebagai props
export default function TopicClient({ initialTopic, initialPosts, initialError, params }) {
  const { topicId } = params;
  const { isAuthenticated, user } = useAuth();
  const { currentLanguage } = useLanguage();
  const router = useRouter();
  const replyFormRef = useRef(null);
  
  // Inisialisasi state dari props
  const [topic, setTopic] = useState(initialTopic);
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(!initialTopic && !initialError);
  const [error, setError] = useState(initialError);
  
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [t, setT] = useState({});

  // Load translations (tetap di client karena butuh context)
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../../../../locales/${currentLanguage}/forumTopic.json`);
        setT(translations.default);
      } catch (error) {
        console.error('Error loading forum topic translations:', error);
        const fallback = await import('../../../../locales/en/forumTopic.json');
        setT(fallback.default);
      }
    };
    loadTranslations();
  }, [currentLanguage]);

  // useEffect untuk fetchTopic sudah tidak diperlukan, data sudah ada dari server.
  // Set loading to false once translations are loaded and initial data is present.
  useEffect(() => {
    if (Object.keys(t).length > 0) {
      setLoading(false);
    }
  }, [t]);

  const scrollToReplyForm = () => {
    if (replyFormRef.current) {
      replyFormRef.current.scrollIntoView({ behavior: 'smooth' });
      replyFormRef.current.focus();
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/forum/topics/${topicId}`));
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(`/api/forum/topics/${topicId}/posts`, { content: replyContent });
      
      setPosts([...posts, data.data]);
      setReplyContent('');
    } catch (err) {
      console.error('Failed to post reply:', err);
      setError(t.error?.failedToPost || 'Failed to post reply. Please try again.');
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
            <p className="mt-4 text-gray-600 font-medium">{t.loading.discussion}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
          <div className="card-glass border-red-200 bg-red-50/80 mb-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 mb-0">{t.error.title}</h3>
                <p className="text-red-700 mt-1">{error || t.error.topicNotFound}</p>
              </div>
            </div>
          </div>
          <Link href="/forum" className="btn btn-outline inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
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
      
      {/* Hero section with topic title */}
      <div className="bg-gradient-to-r from-primary-600/90 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center gap-2 text-white/80 mb-3">
            <Link href="/forum" className="hover:text-white transition-colors">
              {t.navigation.forums}
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/forum/categories/${topic.categoryId}`} className="hover:text-white transition-colors">
              {topic.ForumCategory?.title || t.navigation.category}
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{topic.title}</h1>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              {topic.author?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-sm">
              <span className="text-white/90">{t.topic.startedBy}</span>{' '}
              <span className="font-medium">{topic.author?.name || 'Unknown'}</span>{' '}
              <span className="text-white/80">&bull; {formatDate(topic.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {/* Original post */}
        <div className="card mb-8 hover:shadow-lg">
          <div className="flex flex-col md:flex-row md:gap-6">
            {/* Author sidebar */}
            <div className="md:w-48 mb-4 md:mb-0">
              <div className="flex md:flex-col items-center md:items-start gap-3">
                <div className="avatar avatar-primary h-12 w-12 md:h-16 md:w-16 text-xl">
                  {topic.author?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{topic.author?.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">
                    {topic.author?.role && (
                      <span className="badge badge-primary capitalize">{topic.author.role}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Post content */}
            <div className="flex-1 md:border-l md:pl-6">
              <div className="prose max-w-none">
                {topic.content.split('\n').map((paragraph, i) => (
                  paragraph ? <p key={i} className="mb-4 text-gray-700">{paragraph}</p> : <br key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Replies section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800 m-0">{t.topic.replies}</h2>
              <div className="badge badge-primary">{posts.length}</div>
            </div>
            {isAuthenticated && !topic.isLocked && (
              <button
                onClick={scrollToReplyForm}
                className="btn btn-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t.topic.reply}
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="card-glass text-center mb-8">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-600">{t.emptyState.noReplies}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mb-8">
              {posts.map((post, index) => (
                <div key={post.id} className={`card card-hover ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}`}>
                  <div className="flex flex-col md:flex-row md:gap-6">
                    {/* Author sidebar */}
                    <div className="md:w-48 mb-4 md:mb-0">
                      <div className="flex md:flex-col items-center md:items-start gap-3">
                        <div className="avatar avatar-primary h-10 w-10 md:h-14 md:w-14">
                          {post.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{post.author?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">
                            {post.author?.role && (
                              <span className="badge badge-primary capitalize">{post.author.role}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Post content */}
                    <div className="flex-1 md:border-l md:pl-6">
                      <div className="flex justify-between mb-3">
                        <div className="text-xs text-gray-500">
                          {t.post.posted} {formatDate(post.createdAt)}
                        </div>
                        {post.isEdited && (
                          <span className="text-xs italic text-gray-500">
                            {t.post.edited}
                          </span>
                        )}
                      </div>
                      <div className="prose max-w-none">
                        {post.content.split('\n').map((paragraph, i) => (
                          paragraph ? <p key={i} className="mb-3 text-gray-700">{paragraph}</p> : <br key={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply form or login prompt */}
        {isAuthenticated && !topic.isLocked ? (
          <div className="card-glass bg-white border-primary-100 shadow-lg" id="reply-form">
            <h3 className="text-xl font-bold text-primary-700 mb-4">{t.topic.postReply}</h3>
            <form onSubmit={handleReplySubmit}>
              <div className="mb-4">
                <textarea
                  ref={replyFormRef}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  required
                  rows={6}
                  className="form-input w-full resize-none"
                  placeholder={t.topic.writeReply}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary px-6"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.topic.posting}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      {t.topic.postButton}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : topic.isLocked ? (
          <div className="card-glass bg-yellow-50/80 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-yellow-800 mb-0">{t.locked.title}</h3>
                <p className="text-yellow-700 mt-1">{t.locked.description}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-glass bg-white text-center">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <p className="text-gray-600 mb-6">{t.emptyState.loginRequired}</p>
              <Link 
                href={`/login?redirect=${encodeURIComponent(`/forum/topics/${topicId}`)}`}
                className="btn btn-primary px-8"
              >
                {t.emptyState.loginButton}
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}