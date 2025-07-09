'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

// Terima data awal sebagai props
export default function NewsDetailClient({ initialArticle, initialError }) {
  // Inisialisasi state dari props
  const [article] = useState(initialArticle);
  const [loading] = useState(!initialArticle && !initialError);
  const [error] = useState(initialError);

  // useEffect untuk fetching data sudah tidak diperlukan lagi

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category) => {
    if (!category) return 'Uncategorized';
    switch (category) {
      case 'mental_health': return 'Mental Health';
      case 'obesity': return 'Obesity';
      case 'general': return 'General';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-white to-primary-50/20 flex justify-center items-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-white to-primary-50/20 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-red-500 mb-4 text-lg">{error}</div>
            <Link href="/news" className="btn btn-primary">
              Return to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-white to-primary-50/20 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-gray-800 mb-4 text-lg">Article not found</div>
            <Link href="/news" className="btn btn-primary">
              Return to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50/20">
      {/* Hero section with image if available */}
      {article.imageUrl && (
        <div className="w-full h-[40vh] md:h-80 lg:h-96 relative">
          <div className="absolute inset-0 z-0">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 z-20">
            <div className="max-w-4xl mx-auto">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                article.category === 'mental_health' 
                  ? 'bg-blue-500/90 text-white' 
                  : article.category === 'obesity'
                  ? 'bg-green-500/90 text-white'
                  : 'bg-gray-700/90 text-white'
              }`}>
                {getCategoryLabel(article.category)}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-3 text-shadow-md">{article.title}</h1>
              <div className="flex items-center mt-4 text-white/90">
                <span className="mr-4">
                  {formatDate(article.publishedAt || article.createdAt)}
                </span>
                {article.author && (
                  <span className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white mr-2">
                      {article.author.name.charAt(0).toUpperCase()}
                    </span>
                    By {article.author.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 transition-all duration-300 hover:translate-x-1">
          <Link href="/news" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to News
          </Link>
        </div>
        
        <article className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header section if no image */}
          {!article.imageUrl && (
            <div className="p-8 pb-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  article.category === 'mental_health' 
                    ? 'bg-blue-100 text-blue-800' 
                    : article.category === 'obesity'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getCategoryLabel(article.category)}
                </span>
                <span className="text-gray-500 text-sm">
                  {formatDate(article.publishedAt || article.createdAt)}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{article.title}</h1>
              
              {article.author && (
                <div className="flex items-center mb-6 pb-6 border-b border-gray-100">
                  <div className="avatar avatar-primary w-10 h-10">
                    {article.author.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-3 text-gray-700">
                    By {article.author.name}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Optional inline image for better visibility */}
          {article.imageUrl && (
            <div className="px-8 pt-8">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-auto rounded-lg shadow-md mb-8 transform hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          )}
          
          {/* Article content */}
          <div className="p-8 pt-4">
            <div className="text-gray-800 leading-relaxed space-y-6">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h2 className="text-2xl font-bold text-primary-700 mt-8 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h3 className="text-xl font-bold text-primary-600 mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h4 className="text-lg font-bold text-gray-800 mt-5 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-gray-700 leading-7" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-primary-300 pl-4 italic my-4 text-gray-600" {...props} />
                  ),
                  a: ({node, ...props}) => (
                    <a className="text-primary-600 hover:text-primary-800 underline" {...props} />
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>
        
        {/* Navigation buttons */}
        <div className="mt-12 flex justify-between items-center">
          <Link 
            href="/news" 
            className="btn btn-outline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to articles
          </Link>
          
          <button 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className="btn bg-white hover:bg-gray-50 text-gray-600 shadow-sm"
            aria-label="Scroll to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Top
          </button>
        </div>
      </div>
    </div>
  );
}