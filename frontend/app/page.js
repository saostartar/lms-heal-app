"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import { getPublicNews } from "../lib/newsService";
import { motion } from "framer-motion";

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestNews, setLatestNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/courses/featured");
        setFeaturedCourses(data.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch featured courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setNewsLoading(true);
        const response = await getPublicNews(1, 3);
        
        if (response && response.success) {
          if (response.data && response.data.news) {
            setLatestNews(response.data.news);
          } else if (response.data) {
            setLatestNews(response.data);
          } else {
            setLatestNews([]);
          }
        } else {
          setLatestNews([]);
        }
      } catch (err) {
        console.error("Failed to fetch latest news:", err);
        setLatestNews([]);
      } finally {
        setNewsLoading(false);
      }
    };
  
    fetchLatestNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <Header />

      <main>
        {/* Cutting-edge Hero Section with Geometric Elements */}
        <section className="relative py-20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <div className="hidden lg:block absolute -bottom-24 -left-24 w-96 h-96 border-2 border-primary-200 rounded-full"></div>
            <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 border-2 border-secondary-200 rounded-full"></div>
            
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center opacity-5"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-5">
                  <div className="relative inline-flex">
                    <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-medium px-6 py-2 rounded-full relative z-10">
                      Healthcare Education Platform
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 blur-md rounded-full"></div>
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl xl:text-7xl font-black">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900">
                      Transform Your
                    </span>
                    <div className="relative mt-2">
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 pb-2">
                        Healthcare Career
                      </span>
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
                    </div>
                  </h1>
                </div>
                
                <p className="text-slate-600 text-xl font-light max-w-xl leading-relaxed">
                  Dive into expert-led courses in mental health and obesity management. 
                  <span className="text-primary-600 font-medium"> Build the skills you need</span> to make a greater impact 
                  in your patients' lives.
                </p>
                
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/courses"
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:shadow-primary-500/30 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center justify-center font-medium">
                      Explore Courses
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <div className="absolute top-0 left-full w-full h-full bg-gradient-to-r from-primary-400/20 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </Link>
                  
                  <Link
                    href="/register"
                    className="group relative overflow-hidden rounded-lg border-2 border-secondary-500 bg-white px-8 py-4 text-secondary-500 shadow-lg transition-all duration-300 hover:shadow-secondary-500/20 hover:bg-secondary-50"
                  >
                    <span className="relative z-10 flex items-center justify-center font-medium">
                      Create Account
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                    </span>
                  </Link>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                        <div className={`w-full h-full bg-gradient-to-br ${
                          item % 4 === 0 ? "from-red-400 to-pink-400" : 
                          item % 3 === 0 ? "from-blue-400 to-indigo-400" : 
                          item % 2 === 0 ? "from-green-400 to-teal-400" : 
                          "from-yellow-400 to-orange-400"
                        }`}></div>
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                      +2k
                    </div>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-800">2,000+ professionals</span> trust our platform
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[5/6] overflow-hidden rounded-2xl bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100"></div>
                  
                  {/* Large decorative circle */}
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary-500/20 rounded-full blur-xl"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                      <img 
                        src="/images/hero-image.jpg" 
                        alt="Healthcare professionals learning" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.classList.add('bg-gradient-to-br', 'from-primary-500', 'to-secondary-500');
                          e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-white/20"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg></div>';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Stats badges floating around */}
                  <div className="absolute top-6 -left-4 bg-white rounded-lg shadow-xl p-3 animate-float">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                          <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a9.006 9.006 0 00-3.5.339.75.75 0 00-.5.707v11.374a.75.75 0 001.25.561zM2.25 4.5h1.5a.75.75 0 01.75.75v11.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-600">Courses</div>
                        <div className="text-sm font-bold text-slate-900">50+ Available</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -right-4 bottom-16 bg-white rounded-lg shadow-xl p-3 animate-float animation-delay-1000">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600">
                          <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.747 29.747 0 00-2.455 1.45.75.75 0 10.752 1.298 29.704 29.704 0 002.532-1.524.75.75 0 00-.829-1.224zm6.28-.431a.75.75 0 00-.944.476 28.734 28.734 0 00-1.554 6.299.75.75 0 101.488.174 30.23 30.23 0 011.634-6.62.75.75 0 00-.624-.329z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-600">Certificates</div>
                        <div className="text-sm font-bold text-slate-900">Accredited</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curved section divider */}
        <div className="relative h-24 md:h-40">
          <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 96L60 85.3C120 74.7 240 53.3 360 42.7C480 32 600 32 720 48C840 64 960 96 1080 90.7C1200 85.3 1320 42.7 1380 21.3L1440 0V96H1380C1320 96 1200 96 1080 96C960 96 840 96 720 96C600 96 480 96 360 96C240 96 120 96 60 96H0Z" fill="white"/>
          </svg>
        </div>

        {/* Featured Courses Section */}
        <section className="relative bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2">
                  <div className="h-0.5 w-6 bg-secondary-500"></div>
                  <span className="text-secondary-500 font-semibold">TOP RATED PROGRAMS</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Featured Courses
                  <span className="relative ml-2 inline-block w-3 h-3 rounded-full bg-primary-500">
                    <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping"></span>
                  </span>
                </h2>
              </div>
              
              <Link
                href="/courses"
                className="group mt-4 md:mt-0 inline-flex items-center text-primary-600 font-medium"
              >
                <span className="relative">
                  View All Courses
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
                <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="relative w-20 h-20">
                  <div className="w-full h-full rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-secondary-500 animate-spin"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="group relative overflow-hidden rounded-2xl bg-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                  >
                    {/* Top colored bar - different for each card */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                      index === 0 ? "bg-primary-500" : 
                      index === 1 ? "bg-secondary-500" : 
                      "bg-tertiary-500"
                    }`}></div>
                    
                    <div className="h-52 overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className={`flex items-center justify-center h-full ${
                          index === 0 ? "bg-gradient-to-br from-primary-500/30 to-primary-700/30" : 
                          index === 1 ? "bg-gradient-to-br from-secondary-500/30 to-secondary-700/30" : 
                          "bg-gradient-to-br from-tertiary-500/30 to-tertiary-700/30"
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                               className="w-16 h-16 text-white stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Featured badge */}
                      <div className="absolute top-3 right-3">
                        <div className="relative">
                          <span className="px-4 py-1 bg-white text-slate-900 text-xs font-semibold rounded-full shadow-md">
                            Featured
                          </span>
                          <span className="absolute -inset-1 bg-white/50 rounded-full blur-sm -z-10"></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 border-t border-slate-100 flex flex-col h-64">
                      <div className="mb-4 space-y-1">
                        {/* Pill label for course category/type */}
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          index === 0 ? "bg-primary-100 text-primary-700" : 
                          index === 1 ? "bg-secondary-100 text-secondary-700" : 
                          "bg-tertiary-100 text-tertiary-700"
                        }`}>
                          {course.category || "Healthcare"}
                        </span>
                        
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors duration-300">
                          {course.title}
                        </h3>
                      </div>
                      
                      <p className="text-slate-600 mb-6 line-clamp-3 flex-grow">
                        {course.description}
                      </p>
                      
                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.duration || "8 weeks"}
                          </div>
                          <div className="flex items-center text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {course.lessonCount || "12"} Lessons
                          </div>
                        </div>
                        
                        <Link
                          href={`/preview/courses/${course.id}`}
                          className={`group relative w-full py-3 flex items-center justify-center overflow-hidden rounded-lg ${
                            index === 0 ? "bg-primary-500 hover:bg-primary-600" : 
                            index === 1 ? "bg-secondary-500 hover:bg-secondary-600" : 
                            "bg-tertiary-500 hover:bg-tertiary-600"
                          } text-white font-medium transition-all duration-300`}
                        >
                          <span className="relative z-10 flex items-center">
                            View Course
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Latest News Section */}
        <section className="relative py-24 bg-slate-50 overflow-hidden">
          {/* Decorative backgrounds */}
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary-100"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-secondary-100"></div>
            <div className="absolute top-1/3 right-1/3 w-12 h-12 rounded-full bg-tertiary-300/20"></div>
            <div className="absolute bottom-1/3 left-1/2 w-24 h-24 rounded-full bg-primary-300/20"></div>
            <div className="absolute top-2/3 left-1/3 w-16 h-16 rounded-full bg-secondary-300/20"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center space-x-2 mb-4">
                <div className="h-0.5 w-6 bg-primary-500"></div>
                <span className="text-primary-500 font-semibold">LATEST UPDATES</span>
                <div className="h-0.5 w-6 bg-primary-500"></div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Healthcare News & Insights
              </h2>
              <p className="text-lg text-slate-600">
                Stay up to date with the latest research, trends, and best practices in healthcare education and management.
              </p>
            </div>

            {newsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-16 h-16 border-4 border-secondary-200 border-t-secondary-600 rounded-full animate-spin"></div>
              </div>
            ) : latestNews.length === 0 ? (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No News Available</h3>
                  <p className="text-slate-500 mb-6">We'll be publishing new articles and research findings soon.</p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    <span>Explore Courses Instead</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {latestNews.map((article, index) => {
                  // First article is featured
                  if (index === 0) {
                    return (
                      <div key={article.id} className="col-span-12 lg:col-span-8">
                        <Link href={`/news/${article.id}`} className="group block">
                          <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                            <div className="aspect-video overflow-hidden">
                              {article.imageUrl ? (
                                <img
                                  src={article.imageUrl}
                                  alt={article.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-6">
                              <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full 
                                  ${article.category === "mental_health"
                                    ? "bg-blue-100 text-blue-800"
                                    : article.category === "obesity"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-slate-100 text-slate-800"}`}
                                >
                                  {article.category === "mental_health"
                                    ? "Mental Health"
                                    : article.category === "obesity"
                                    ? "Obesity"
                                    : "General"}
                                </span>
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                  Featured
                                </span>
                              </div>
                              
                              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                                {article.title}
                              </h3>
                              
                              <p className="text-slate-600 mb-6 line-clamp-2">
                                {article.excerpt || article.content?.substring(0, 150) + "..." || "Learn more about this latest healthcare development..."}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                  {formatDate(article.publishedAt || article.createdAt)}
                                </div>
                                <span className="text-primary-600 font-medium group-hover:underline">Read more</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  }
                  
                  // Other articles
                  return (
                    <div key={article.id} className="col-span-12 lg:col-span-4">
                      <Link href={`/news/${article.id}`} className="group block h-full">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 h-full flex flex-col">
                          <div className="aspect-[4/3] overflow-hidden">
                            {article.imageUrl ? (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-5 flex-grow flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                ${article.category === "mental_health"
                                  ? "bg-blue-100 text-blue-800"
                                  : article.category === "obesity"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-800"}`}
                              >
                                {article.category === "mental_health"
                                  ? "Mental Health"
                                  : article.category === "obesity"
                                  ? "Obesity"
                                  : "General"}
                              </span>
                              <div className="text-xs text-slate-500">
                                {formatDate(article.publishedAt || article.createdAt)}
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                              {article.title}
                            </h3>
                            
                            <div className="mt-auto pt-3 flex items-center text-primary-600 font-medium text-sm">
                              Read Article
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-16 text-center">
              <Link
                href="/news"
                className="relative inline-flex group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                <button className="relative flex items-center gap-3 px-8 py-4 bg-white rounded-lg text-slate-900 font-semibold">
                  View All News
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="relative py-24 bg-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/dot-pattern.svg')] bg-repeat opacity-5"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-4 py-1 bg-slate-100 text-slate-800 text-sm font-medium rounded-full inline-block mb-4">WHY CHOOSE US</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Learning that makes a difference
              </h2>
              <p className="text-lg text-slate-600">
                Our platform is designed to provide the most effective and engaging education for healthcare professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  ),
                  title: "Evidence-Based Content",
                  description: "All our courses are developed using the latest research and evidence-based practices in healthcare education."
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Accredited Programs",
                  description: "Earn recognized continuing education credits that meet professional standards and requirements."
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-tertiary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: "Expert Instructors",
                  description: "Learn from leading healthcare professionals with years of clinical and teaching experience."
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-lg transform transition-all duration-300 group-hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 mb-6 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-20 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                      Ready to advance your healthcare career?
                    </h3>
                    <p className="text-slate-600">
                      Join thousands of healthcare professionals who are upgrading their skills and knowledge through our platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/courses"
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
                      >
                        Browse Courses
                      </Link>
                      <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 text-primary-600 font-medium rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Sign Up Now
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"></div>
                  <img 
                    src="/images/healthcare-team.jpg" 
                    alt="Healthcare professionals" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23cccccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Scroll to top button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors duration-300"
            aria-label="Scroll to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}