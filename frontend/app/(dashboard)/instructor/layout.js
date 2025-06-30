'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/context/auth-context';

export default function InstructorLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && user?.role !== 'instructor' && user?.role !== 'admin') {
      router.push('/'); // Redirect non-instructors
    }
  }, [loading, isAuthenticated, router, user]);

  // Show loading state
  if (loading || !isAuthenticated || (user?.role !== 'instructor' && user?.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}