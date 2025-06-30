'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../lib/axios';
import Header from '../../components/layout/header';
import Footer from '../../components/layout/footer';
import { ChatBubbleLeftRightIcon, ChevronRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function ForumHomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/forum/categories');
        setCategories(data.data);
      } catch (err) {
        console.error('Failed to fetch forum categories:', err);
        setError('Failed to load forum categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20 relative overflow-hidden">
          {/* Abstract shapes for visual interest */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary-400 opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full bg-primary-500 opacity-10 blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Community Forums</h1>
            <p className="text-xl text-white/90 mb-8">
              Join discussions, ask questions, and connect with others in our learning community
            </p>
            <div className="inline-flex items-center px-5 py-2.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              <span>{categories.length} Discussion Categories</span>
            </div>
          </div>
        </div>
      </section>
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 -mt-16 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md">
            <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading forum categories...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl flex items-center justify-center shadow-sm">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Unable to Load Forums</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-300"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="card card-hover group flex flex-col h-full transform hover:scale-[1.01] transition-all">
                {/* Category header with gradient */}
                <div className="rounded-t-xl p-5 bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    </div>
                    <span className="badge badge-primary">{category.topicCount || 0} Topics</span>
                  </div>
                  <Link href={`/forum/categories/${category.id}`} className="group-hover:text-primary-700">
                    <h2 className="text-xl font-bold mb-0 text-gray-800 group-hover:text-primary-700">{category.title}</h2>
                  </Link>
                </div>
                
                {/* Category body */}
                <div className="p-5 flex-grow">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6">{category.description}</p>
                </div>
                
                {/* Category footer */}
                <div className="px-5 py-4 border-t border-gray-100 mt-auto">
                  <Link 
                    href={`/forum/categories/${category.id}`}
                    className="flex items-center justify-between w-full text-primary-600 font-medium hover:text-primary-700 transition-colors group"
                  >
                    <span>View Discussions</span>
                    <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        
        
        {/* Empty state */}
        {!loading && !error && categories.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="h-10 w-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Categories Yet</h3>
            <p className="text-gray-600 mb-6">Forum categories will appear here once they're created</p>
            <Link href="/forum/new" className="btn btn-primary inline-flex">
              Request a Category
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}