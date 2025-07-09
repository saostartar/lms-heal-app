'use client';

import { useLanguage } from '../../lib/context/LanguageContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Footer() {
  const { currentLanguage } = useLanguage(); // Ubah dari 'language' ke 'currentLanguage'
  const [t, setT] = useState({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../../locales/${currentLanguage}/footer.json`);
        setT(translations.default);
      } catch (error) {
        console.error('Error loading footer translations:', error);
        // Fallback to English if translation fails
        const fallback = await import('../../locales/en/footer.json');
        setT(fallback.default);
      }
    };

    loadTranslations();
  }, [currentLanguage]); // Ubah dependency ke 'currentLanguage'

  // Return loading state if translations aren't loaded yet
  if (!t.brand) {
    return (
      <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-700 rounded mb-8"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-tertiary-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand section */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              {/* Logo Image */}
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="HEAL Student Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  {t.brand?.title}
                </span>
                <div className="text-xs text-gray-400 -mt-1">{t.brand?.subtitle}</div>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed max-w-md">
              {t.brand?.description}
            </p>
            
            {/* Social media */}
            <div className="flex space-x-4">
              <span className="text-sm text-gray-400 font-medium">{t.social?.followUs}</span>
              {[
                { name: 'facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { name: 'instagram', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.928-.875 2.026-1.365 3.323-1.365s2.448.49 3.323 1.365c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.13H14.17c-.437-.437-1.026-.656-1.765-.656-.739 0-1.328.219-1.765.656H8.53c-.437.437-.656 1.026-.656 1.765v2.625c0 .739.219 1.328.656 1.765h2.11c.437.437 1.026.656 1.765.656.739 0 1.328-.219 1.765-.656h2.109c.437-.437.656-1.026.656-1.765V9.623c0-.739-.219-1.328-.656-1.765z' },
                { name: 'twitter', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
                { name: 'youtube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' }
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="group w-10 h-10 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-primary-500 hover:to-secondary-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <svg className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              {t.quickLinks?.title}
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: t.quickLinks?.home, href: '/' },
                { name: t.quickLinks?.courses, href: '/courses' },
                { name: t.quickLinks?.forum, href: '/forum' },
                { name: t.quickLinks?.news, href: '/news' },
                { name: t.quickLinks?.about, href: '/about-us' },
                { name: t.quickLinks?.faq, href: '/faq' }
              ].filter(item => item.name).map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm flex items-center group"
                  >
                    <svg className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Program & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              {t.programs?.title}
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-secondary-500 to-tertiary-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: t.programs?.freeCourses, href: '/courses' },
                { name: t.programs?.consultation, href: '/consultation' },
                { name: t.programs?.weeklySession, href: '/weekly-session' },
                { name: t.programs?.helpCenter, href: '/help' },
                { name: t.programs?.contactMentor, href: '/contact-mentor' },
                { name: t.programs?.privacy, href: '/privacy' }
              ].filter(item => item.name).map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className="text-gray-300 hover:text-secondary-400 transition-colors text-sm flex items-center group"
                  >
                    <svg className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats section */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 text-center">
            {[
              { label: t.stats?.availableCourses, value: '6+', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
              { label: t.stats?.freeCourses, value: '✓', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
            ].filter(stat => stat.label).map((stat, index) => (
              <div key={index} className="group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 group-hover:border-primary-500/50 group-hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-primary-400 group-hover:text-primary-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} {t.legal?.copyright}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t.legal?.platformSubtitle}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-xs">
            {[
              { name: t.legal?.terms, href: '/terms' },
              { name: t.legal?.privacyPolicy, href: '/privacy' },
              { name: t.legal?.cookiePolicy, href: '/cookies' }
            ].filter(item => item.name).map((item) => (
              <a 
                key={item.name}
                href={item.href} 
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        {/* Back to top button */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-br from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label={t.backToTop}
            title={t.backToTop}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}