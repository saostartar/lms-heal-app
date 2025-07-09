"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/header";
import Footer from "../../components/layout/footer";
import { useLanguage } from "../../lib/context/LanguageContext";
import Link from "next/link";

export default function AboutUs() {
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [t, setT] = useState({});

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../../locales/${currentLanguage}/aboutUs.json`);
        setT(translations.default);
      } catch (error) {
        console.error('Error loading about us translations:', error);
        // Fallback to English if translation fails
        const fallback = await import('../../locales/en/aboutUs.json');
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

  const instructors = [
    {
      name: "Judith Klein-Seetharaman",
      affiliation: "College of Health Solutions, Arizona State University",
      country: "usa",
      image: "/images/instructors/judith.png"
    },
    {
      name: "Associate Prof. Dr. Azmawaty Binti Mohamad Nor",
      affiliation: "Universiti Malaya, Malaysia",
      country: "malaysia",
      image: "/images/instructors/azmawaty.png"
    },
    {
      name: "Wulan Patria Saroinsong, S.Psi., M.Pd, Ph.D",
      affiliation: "Universitas Negeri Surabaya, Indonesia",
      country: "indonesia",
      image: "/images/instructors/wulan.jpg"
    },
    {
      name: "Prof. Sujarwanto, M.Pd",
      affiliation: "Universitas Negeri Surabaya, Indonesia",
      country: "indonesia",
      image: "/images/instructors/sujarwanto.jpg"
    },
    {
      name: "Nur Ilahi Anjani, S.Ked., M.Kes.",
      affiliation: "Universitas Negeri Surabaya, Indonesia",
      country: "indonesia",
      image: "/images/instructors/anjani.png"
    }
  ];

  // Helper function to get country display name
  const getCountryName = (countryCode) => {
    return t.instructors?.countries?.[countryCode] || countryCode.toUpperCase();
  };

  // Helper function to get country badge color
  const getCountryBadgeColor = (countryCode) => {
    switch(countryCode) {
      case 'usa': return 'bg-red-500';
      case 'malaysia': return 'bg-green-600';
      case 'indonesia': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  // Return loading state if translations aren't loaded yet
  if (!t.hero) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-hidden">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary-500/90 to-secondary-600">
          {/* Decorative elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white"
            >
              <div className="inline-flex items-center space-x-2 mb-6">
                <div className="h-0.5 w-8 bg-white/50"></div>
                <span className="text-white/90 font-semibold text-lg">{t.hero.sectionLabel}</span>
                <div className="h-0.5 w-8 bg-white/50"></div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t.hero.title}
              </h1>
              
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                {t.hero.description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="relative py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Paragraph 1 */}
                <div className="bg-gradient-to-br from-slate-50 to-primary-50/30 rounded-2xl p-8 border border-slate-100">
                  <p className="text-lg text-slate-700 leading-relaxed">
                    <span className="font-bold text-primary-600">{t.content.paragraph1.brandName}</span> 
                    {" " + t.content.paragraph1.description}
                  </p>
                </div>

                {/* Paragraph 2 */}
                <div className="bg-gradient-to-br from-secondary-50/30 to-tertiary-50/30 rounded-2xl p-8 border border-slate-100">
                  <p className="text-lg text-slate-700 leading-relaxed">
                    {t.content.paragraph2.description}
                    <span className="font-semibold text-secondary-600"> {t.content.paragraph2.countries} </span>
                    {t.content.paragraph2.collaboration}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="relative py-20 bg-gradient-to-br from-slate-50 to-primary-50/30">
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
                <span className="text-primary-500 font-semibold text-lg">{t.team.sectionLabel}</span>
                <div className="h-0.5 w-8 bg-primary-500"></div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                {t.team.title}
              </h2>
              
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                {t.team.description}
              </p>
            </motion.div>

            {/* Instructors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map((instructor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Image Container */}
                  <div className="relative h-64 bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
                    <img
                      src={instructor.image}
                      alt={instructor.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&size=400&background=random&color=fff&bold=true`;
                      }}
                    />
                    
                    {/* Country Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCountryBadgeColor(instructor.country)}`}>
                        {getCountryName(instructor.country)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                      {instructor.name}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {instructor.affiliation}
                    </p>

                    {/* Decorative element */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-sm font-medium">{t.team.expertBadge}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Quote Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary-500/90 to-secondary-600 overflow-hidden">
          {/* Decorative backgrounds */}
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/10"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
              {/* Quote Icon */}
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>

              {/* Main Quote */}
              <blockquote className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                "{t.philosophy.quote}"
              </blockquote>

              {/* Attribution */}
              <div className="space-y-2">
                <div className="w-16 h-0.5 bg-white/50 mx-auto"></div>
                <p className="text-white/80 text-lg font-medium tracking-wider">
                  {t.philosophy.attribution}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center space-x-2 mb-6">
                  <div className="h-0.5 w-8 bg-primary-500"></div>
                  <span className="text-primary-500 font-semibold text-lg">{t.contact.sectionLabel}</span>
                  <div className="h-0.5 w-8 bg-primary-500"></div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  {t.contact.title}
                </h2>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary-50/50 to-secondary-50/50 rounded-2xl p-8 border border-slate-100 text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Wulan Patria Saroinsong
                </h3>
                
                <p className="text-slate-600 mb-4">{t.contact.leadTitle}</p>
                
                <div className="flex items-center justify-center space-x-2 text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a 
                    href="mailto:wulanpatria@unesa.ac.id" 
                    className="text-lg font-medium hover:text-primary-700 transition-colors"
                  >
                    wulanpatria@unesa.ac.id
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative py-16 bg-gradient-to-br from-slate-50 to-primary-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                {t.cta.title}
              </h2>
              
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                {t.cta.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {t.cta.viewCourses}
                </Link>
                
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-primary-600 font-medium rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {t.cta.registerNow}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}