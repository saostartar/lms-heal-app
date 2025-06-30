"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/context/auth-context";

export default function Header({ toggleSidebar }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-lg' 
          : 'bg-white/95 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo and navigation */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-50/80 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-600 w-9 h-9 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent tracking-tight">
                  EduLMS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:ml-10 sm:flex sm:space-x-8 items-center">
              {[
                { href: "/courses", label: "Courses" },
                { href: "/news", label: "News" },
                { href: "/forum", label: "Forum" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-3 py-4 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              ))}
              
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="relative px-3 py-4 text-sm font-medium text-primary-600 group"
                >
                  <span className="flex items-center">
                    Admin
                    <span className="ml-1.5 w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right side: User section */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="ml-3 relative flex items-center user-menu-container">
                {/* Role badge */}
                <div className="mr-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                    user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                      : user?.role === 'instructor' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {user?.role === 'admin' ? 'Admin' : 
                     user?.role === 'instructor' ? 'Instructor' : 'Learner'}
                  </div>
                </div>
                
                {/* User avatar button */}
                <div>
                  <button
                    type="button"
                    className={`relative overflow-hidden rounded-full h-10 w-10 bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-medium border-2 border-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      isUserMenuOpen ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </button>
                </div>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-48 w-72 rounded-xl shadow-xl py-2 bg-white/95 backdrop-blur-lg ring-1 ring-black/5 focus:outline-none z-10 border border-gray-100 transform transition-all duration-200 ease-out">
                    <div className="p-4 pb-2">
                      <div className="font-semibold text-primary-600 text-lg">{user?.name}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate">{user?.email}</div>
                      <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium capitalize shadow-sm ${
                        user?.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : user?.role === 'instructor' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {user?.role}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <div className="px-2">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50/80 hover:text-primary-600 rounded-lg transition-colors duration-200 gap-3 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200 transition-colors duration-200">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </span>
                        Your Profile
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50/80 hover:text-primary-600 rounded-lg transition-colors duration-200 gap-3 group mt-1"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200 transition-colors duration-200">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                        </span>
                        Settings
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <div className="px-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 rounded-lg transition-colors duration-200 gap-3 group"
                      >
                        <span className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                          </svg>
                        </span>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-300 hover:border-primary-400 rounded-lg transition-colors duration-200 hover:bg-primary-50/50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}