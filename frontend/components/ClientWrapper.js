'use client';

import { useEffect } from 'react';
import '../lib/i18n';

export default function ClientWrapper({ children }) {
  useEffect(() => {
    // Initialize i18n on client side
  }, []);

  return <>{children}</>;
}