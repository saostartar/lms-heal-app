'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/context/auth-context';
import { useLanguage } from '../../../lib/context/LanguageContext';
import Header from '../../../components/layout/header';
import Footer from '../../../components/layout/footer';

export default function Login() {
  const { currentLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [t, setT] = useState({});
  const { login } = useAuth();

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../../../locales/${currentLanguage}/login.json`);
        setT(translations.default);
      } catch (error) {
        console.error('Error loading login translations:', error);
        // Fallback to English if translation fails
        const fallback = await import('../../../locales/en/login.json');
        setT(fallback.default);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { success, message } = await login(formData.email, formData.password);
      if (!success) {
        setError(message);
      }
    } catch (err) {
      setError(t.errors?.generic || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Return loading state if translations aren't loaded yet
  if (!t.page) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-40 -right-48 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -left-24 bottom-40 w-80 h-80 bg-secondary-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <h2 className="mt-6 text-4xl font-extrabold text-gray-900 tracking-tight">
              {t.page.title}
            </h2>
            <p className="mt-2 text-center text-lg text-gray-600">
              {t.page.subtitle}
            </p>
          </div>
          
          <div className="card-glass p-8 rounded-xl">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.email.label}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input w-full text-black"
                  placeholder={t.form.email.placeholder}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t.form.password.label}
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    {t.form.forgotPassword}
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="form-input w-full text-black"
                  placeholder={t.form.password.placeholder}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t.form.rememberMe}
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-3 font-medium"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.form.submitButton.loading}
                    </span>
                  ) : (
                    t.form.submitButton.default
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-6">
            {t.footer.noAccount}{' '}
            <Link 
              href="/register" 
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              {t.footer.createAccount}
            </Link>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}