'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function UserSidebar({ pathname, user }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const isActivePath = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Updated learner links with icons
  const learnerLinks = [
    { name: 'Dashboard', href: '/learner/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Browse Courses', href: '/learner/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'My Courses', href: '/learner/my-courses', icon: 'M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Forum', href: '/forum', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
    { name: 'Profile', href: '/learner/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];
  
  const instructorLinks = [
    { name: 'Dashboard', href: '/instructor/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'My Courses', href: '/instructor/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Create Course', href: '/instructor/courses/create', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Course Analytics', href: '/instructor/analytics/courses', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Quiz Analytics', href: '/instructor/analytics/quizzes', icon: 'M12 8v4l3 2m-3-2h-3m0 0V8m0 4h3m0 0l-3-2m3 2l3-2m-6 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Profile', href: '/instructor/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  // Determine which links to show based on user role
  const links = user?.role === 'instructor' ? instructorLinks : learnerLinks;
  const roleTitle = user?.role === 'instructor' ? 'Instructor Portal' : 'Learning Portal';

  return (
    <div className={`h-full flex-1 flex flex-col min-h-0 bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Sidebar header with collapse toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!collapsed && (
            <span className="text-lg font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {roleTitle}
            </span>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full hover:bg-gray-100 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 py-3">
            <div className={`badge badge-primary bg-gradient-to-r ${
              user?.role === 'instructor' ? 'from-secondary-100 to-secondary-200 text-secondary-700' : 'from-primary-100 to-primary-200 text-primary-700'
            }`}>
              {user?.role === 'instructor' ? 'Instructor' : 'Learner'}
            </div>
          </div>
        )}
        
        {/* Navigation links */}
        <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Sidebar">
          {links.map((item) => {
            const isActive = isActivePath(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'sidebar-link-active'
                    : 'sidebar-link-inactive'
                } sidebar-link group`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                
                {!collapsed && <span>{item.name}</span>}
                
                {isActive && !collapsed && (
                  <span className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-primary-600"></span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User info at bottom */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="avatar avatar-primary h-10 w-10">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}