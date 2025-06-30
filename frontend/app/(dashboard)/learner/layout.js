'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/context/auth-context';

export default function LearnerLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && user?.role !== 'learner') {
      router.push('/'); // Redirect non-learners
    }
  }, [loading, isAuthenticated, router, user]);

  // Show loading state while checking authentication
  if (loading || !isAuthenticated || user?.role !== 'learner') {
    return null;
  }

  // Just return the children directly without any additional DOM elements
  return <>{children}</>;
}