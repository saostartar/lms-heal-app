'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/context/auth-context';
import Header from '../../components/layout/header';
import AdminSidebar from '../../components/layout/admin-sidebar';
import UserSidebar from '../../components/layout/user-sidebar';

export default function DashboardLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Don't render anything during authentication check
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Determine which sidebar to show based on user role
  const renderSidebar = () => {
    // Only render sidebar if user is fully loaded and has a role
    if (!user) return null;
    
    if (user.role === 'admin') {
      return <AdminSidebar pathname={pathname} />;
    }
    // Make sure we're only rendering this once by checking the pathname
    // This ensures we don't try to render the sidebar for nested layouts
    if (pathname.includes('/learner/') || pathname.includes('/instructor/')) {
      return <UserSidebar pathname={pathname} user={user} />;
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-grow">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          {renderSidebar()}
        </div>
        
        {/* Mobile Sidebar (when open) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={toggleSidebar}
            ></div>
            
            {/* Sidebar */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={toggleSidebar}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {renderSidebar()}
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}