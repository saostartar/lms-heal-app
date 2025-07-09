'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Header from '../../components/layout/header';
import Footer from '../../components/layout/footer';
import { useLanguage } from '../../lib/context/LanguageContext';

export default function FAQPage() {
  const { currentLanguage } = useLanguage();
  const [openFAQ, setOpenFAQ] = useState(null);
  const [t, setT] = useState({});

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../../locales/${currentLanguage}/FAQ.json`);
        setT(translations.default);
      } catch (error) {
        console.error('Error loading FAQ translations:', error);
        // Fallback to English if translation fails
        const fallback = await import('../../locales/en/FAQ.json');
        setT(fallback.default);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // Helper function to get course color classes
  const getCourseColorClass = (index) => {
    const colors = [
      "bg-green-50 border-green-200 text-green-800",
      "bg-blue-50 border-blue-200 text-blue-800", 
      "bg-purple-50 border-purple-200 text-purple-800",
      "bg-indigo-50 border-indigo-200 text-indigo-800",
      "bg-orange-50 border-orange-200 text-orange-800",
      "bg-red-50 border-red-200 text-red-800"
    ];
    return colors[index % colors.length];
  };

  // Render FAQ Answer based on question ID
  const renderFAQAnswer = (faq) => {
    switch (faq.id) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {faq.answer.intro.split('USA, Malaysia dan Indonesia').map((part, index) => 
                index === 0 ? (
                  <span key={index}>
                    {part}
                    <span className="font-semibold text-primary-600">
                      {faq.answer.countries.usa}, {faq.answer.countries.malaysia} {currentLanguage === 'id' ? 'dan' : 'and'} {faq.answer.countries.indonesia}
                    </span>
                  </span>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {faq.answer.coverage.split('psikologi').map((part, index) => 
                index === 0 ? (
                  <span key={index}>
                    {part}
                    <span className="font-semibold text-secondary-600">{faq.answer.subjects.psychology}</span>
                  </span>
                ) : (
                  <span key={index}>
                    {part.split('kesehatan mental').map((subPart, subIndex) => 
                      subIndex === 0 ? (
                        <span key={subIndex}>
                          {subPart}
                          <span className="font-semibold text-tertiary-600">{faq.answer.subjects.mentalHealth}</span>
                        </span>
                      ) : (
                        <span key={subIndex}>
                          {subPart.split('gizi yang seimbang').map((finalPart, finalIndex) => 
                            finalIndex === 0 ? (
                              <span key={finalIndex}>
                                {finalPart}
                                <span className="font-semibold text-primary-600">{faq.answer.subjects.nutrition}</span>
                              </span>
                            ) : (
                              <span key={finalIndex}>{finalPart}</span>
                            )
                          )}
                        </span>
                      )
                    )}
                  </span>
                )
              )}
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <p className="text-amber-800 text-sm">
                <strong>{faq.answer.background.title}</strong> {faq.answer.background.content}
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {faq.answer.intro.split('terbuka secara umum bagi siapa saja').map((part, index) => 
                index === 0 ? (
                  <span key={index}>
                    {part}
                    <span className="font-semibold text-green-600">
                      {currentLanguage === 'id' ? 'terbuka secara umum bagi siapa saja' : 'open to everyone'}
                    </span>
                  </span>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </p>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-800 text-sm">
                  <strong>{faq.answer.expertNote.title}</strong>, {faq.answer.expertNote.content}
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {faq.answer.intro}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-blue-800">{faq.answer.schedule.title}</span>
                </div>
                <p className="text-blue-700 text-sm">{faq.answer.schedule.content}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span className="font-semibold text-purple-800">{faq.answer.language.title}</span>
                </div>
                <p className="text-purple-700 text-sm">{faq.answer.language.content}</p>
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold text-indigo-800">{faq.answer.support.title}</span>
              </div>
              <p className="text-indigo-700 text-sm">{faq.answer.support.content}</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed mb-6">
              {faq.answer.intro.split('6 kursus komprehensif').map((part, index) => 
                index === 0 ? (
                  <span key={index}>
                    {part}
                    <span className="font-bold text-primary-600">
                      {currentLanguage === 'id' ? '6 kursus komprehensif' : '6 comprehensive courses'}
                    </span>
                  </span>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faq.answer.courses.map((course, index) => (
                <div key={course.num} className={`rounded-lg p-4 border ${getCourseColorClass(index)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{course.icon}</div>
                    <div>
                      <div className="font-semibold text-sm mb-1">{faq.answer.courseLabel} {course.num}</div>
                      <div className="text-sm font-medium">{course.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{faq.answer.free}</div>
                <div className="text-lg text-green-700 font-medium mb-4">{faq.answer.noHiddenCosts}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {faq.answer.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-green-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {faq.answer.implementation.split('mengimplementasikannya dalam kegiatan sehari-hari').map((part, index) => 
                index === 0 ? (
                  <span key={index}>
                    {part}
                    <span className="font-semibold text-primary-600">
                      {currentLanguage === 'id' ? 'mengimplementasikannya dalam kegiatan sehari-hari' : 'implement it in your daily activities'}
                    </span>
                  </span>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </p>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {faq.answer.intro}
            </p>
            <div className="grid grid-cols-1 gap-4">
              {faq.answer.supports.map((support, index) => {
                const colors = [
                  "bg-blue-50 border-blue-200",
                  "bg-purple-50 border-purple-200", 
                  "bg-green-50 border-green-200"
                ];
                const iconColors = [
                  "bg-blue-100 text-blue-600",
                  "bg-purple-100 text-purple-600",
                  "bg-green-100 text-green-600"
                ];
                const textColors = [
                  "text-blue-800 text-blue-700",
                  "text-purple-800 text-purple-700",
                  "text-green-800 text-green-700"
                ];
                
                return (
                  <div key={index} className={`rounded-lg p-4 border ${colors[index]}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${iconColors[index]}`}>
                        {index === 0 && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {index === 1 && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                        {index === 2 && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className={`font-semibold mb-1 ${textColors[index].split(' ')[0]}`}>{support.title}</h4>
                        <p className={`text-sm ${textColors[index].split(' ')[1]}`}>{support.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Return loading state if translations aren't loaded yet
  if (!t.hero) {
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-secondary-600 to-tertiary-600 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 rounded-full bg-white/20"></div>
          <div className="absolute bottom-1/3 left-1/2 w-32 h-32 rounded-full bg-white/10"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 mb-6">
              <div className="h-0.5 w-8 bg-white/60"></div>
              <span className="text-white/90 font-semibold text-lg">{t.hero.sectionLabel}</span>
              <div className="h-0.5 w-8 bg-white/60"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              {t.hero.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto">
              {t.hero.description.split('HEAL Student').map((part, index) => 
                index === 0 ? (
                  <span key={index}>
                    {part}
                    <span className="font-semibold text-yellow-300">HEAL Student</span>
                  </span>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </p>
          </motion.div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
            <path d="M0 96L60 85.3C120 74.7 240 53.3 360 42.7C480 32 600 32 720 48C840 64 960 96 1080 90.7C1200 85.3 1320 42.7 1380 21.3L1440 0V96H1380C1320 96 1200 96 1080 96C960 96 840 96 720 96C600 96 480 96 360 96C240 96 120 96 60 96H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      {/* FAQ Content */}
      <main className="flex-grow py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {t.faqData.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                >
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openFAQ === faq.id ? (
                      <ChevronUpIcon className="h-6 w-6 text-primary-600 transform transition-transform duration-200" />
                    ) : (
                      <ChevronDownIcon className="h-6 w-6 text-gray-400 transform transition-transform duration-200" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                        <div className="prose prose-lg max-w-none">
                          {renderFAQAnswer(faq)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl"
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
                {t.cta.title}
              </h2>
              <p className="text-xl text-white/90 mb-8">
                {t.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300 shadow-lg"
                >
                  {t.cta.registerButton}
                </a>
                <a
                  href="/courses"
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-colors duration-300 border border-white/20"
                >
                  {t.cta.coursesButton}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}