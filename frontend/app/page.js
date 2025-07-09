"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../lib/context/LanguageContext';
import Header from '../components/layout/header';
import Footer from '../components/layout/footer';

export default function Home() {
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [t, setT] = useState({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../locales/${currentLanguage}/home.json`);
        setT(translations.default);
      } catch (error) {
        console.error('Error loading home translations:', error);
        // Fallback to English if translation fails
        const fallback = await import('../locales/en/home.json');
        setT(fallback.default);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  useEffect(() => {
    // Simulate loading for smooth animations
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Return loading state if translations aren't loaded yet
  if (!t.hero) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <Header />

      <main>
        {/* Hero Section - Top Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -top-4 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
              
              {/* Left Content */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-5"
                >
                  <div className="relative inline-flex">
                    <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-medium px-6 py-2 rounded-full relative z-10">
                      {t.hero.badge}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 blur-md rounded-full"></div>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900">
                      {t.hero.welcome}
                    </span>
                    <div className="relative mt-2">
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 pb-2">
                        {t.hero.brandName}
                      </span>
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
                    </div>
                    <span className="block text-2xl md:text-3xl text-slate-600 font-normal mt-2">
                      {t.hero.subtitle}
                    </span>
                  </h1>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-slate-600 text-xl font-light max-w-2xl leading-relaxed"
                >
                  {t.hero.description}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="pt-4"
                >
                  <Link
                    href="/courses"
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:shadow-primary-500/30 hover:scale-105 inline-flex items-center"
                  >
                    <span className="relative z-10 flex items-center justify-center font-medium text-lg">
                      {t.hero.ctaButton}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </motion.div>
              </div>

              {/* Right Content - Hero Image/Graphics */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="relative w-full h-96 lg:h-[500px]">
                  {/* Placeholder for hero image - you can replace with actual image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-secondary-100 to-tertiary-100 rounded-3xl shadow-2xl"></div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-10 right-10 w-16 h-16 bg-secondary-200 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 right-6 w-12 h-12 bg-tertiary-200 rounded-full animate-ping"></div>
                  
                  {/* Central content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto">
                        <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-800">{t.heroImage.title}</h3>
                        <p className="text-slate-600">{t.heroImage.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Curved section divider */}
        <div className="relative h-24 md:h-40">
          <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 96L60 85.3C120 74.7 240 53.3 360 42.7C480 32 600 32 720 48C840 64 960 96 1080 90.7C1200 85.3 1320 42.7 1380 21.3L1440 0V96H1380C1320 96 1200 96 1080 96C960 96 840 96 720 96C600 96 480 96 360 96C240 96 120 96 60 96H0Z" fill="white"/>
          </svg>
        </div>

        {/* Middle Section - Background & Mission */}
        <section className="relative bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center space-x-2 mb-6">
                <div className="h-0.5 w-8 bg-primary-500"></div>
                <span className="text-primary-500 font-semibold text-lg">{t.mission.sectionLabel}</span>
                <div className="h-0.5 w-8 bg-primary-500"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">
                {t.mission.title}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="bg-gradient-to-br from-slate-50 to-primary-50 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{t.mission.eraOfChange.title}</h3>
                      <p className="text-slate-700 leading-relaxed">
                        {t.mission.eraOfChange.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 shadow-lg border-l-4 border-red-400">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{t.mission.currentSituation.title}</h3>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        {t.mission.currentSituation.description}
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-semibold text-red-800">{t.mission.currentSituation.statSource}</span>
                        </div>
                        <p 
                          className="text-sm text-red-700"
                          dangerouslySetInnerHTML={{ __html: t.mission.currentSituation.statText }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-black">{t.mission.ourMission.title}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-xl font-semibold text-white/90">
                        "{t.mission.ourMission.quote}"
                      </p>
                      <p className="text-white/80 leading-relaxed">
                        {t.mission.ourMission.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/70">{t.mission.ourMission.psychology}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/70">{t.mission.ourMission.mentalHealth}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/70">{t.mission.ourMission.nutrition}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bottom Section - Join Us Call to Action */}
        <section className="relative py-24 bg-gradient-to-br from-slate-50 to-primary-50 overflow-hidden">
          {/* Decorative backgrounds */}
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary-100/50"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-secondary-100/50"></div>
            <div className="absolute top-1/3 right-1/3 w-12 h-12 rounded-full bg-tertiary-300/30"></div>
            <div className="absolute bottom-1/3 left-1/2 w-24 h-24 rounded-full bg-primary-300/30"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center space-x-2 mb-6">
                <div className="h-0.5 w-8 bg-secondary-500"></div>
                <span className="text-secondary-500 font-semibold text-lg">{t.joinUs.sectionLabel}</span>
                <div className="h-0.5 w-8 bg-secondary-500"></div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">
                {t.joinUs.title}
              </h2>
              
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p 
                      className="text-lg text-slate-700 leading-relaxed mb-6"
                      dangerouslySetInnerHTML={{ __html: t.joinUs.description }}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-primary-50 rounded-lg p-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-primary-800">{t.joinUs.features.qaSession}</p>
                      </div>
                      
                      <div className="bg-secondary-50 rounded-lg p-4">
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-secondary-800">{t.joinUs.features.groupDiscussion}</p>
                      </div>
                      
                      <div className="bg-secondary-50 rounded-lg p-4">
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-secondary-800">{t.joinUs.features.counseling}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/schedule"
                  className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-700 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:shadow-secondary-500/30 hover:scale-105 inline-flex items-center justify-center"
                >
                  <span className="relative z-10 flex items-center font-medium text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t.joinUs.buttons.schedule}
                  </span>
                  <div className="absolute top-0 left-full w-full h-full bg-gradient-to-r from-secondary-400/20 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </Link>
                
                <Link
                  href="/courses"
                  className="group relative overflow-hidden rounded-lg border-2 border-primary-500 bg-white px-8 py-4 text-primary-500 shadow-lg transition-all duration-300 hover:shadow-primary-500/20 hover:bg-primary-50 inline-flex items-center justify-center"
                >
                  <span className="relative z-10 flex items-center font-medium text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {t.joinUs.buttons.startLearning}
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Scroll to top button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors duration-300"
            aria-label={t.accessibility.scrollToTop}
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