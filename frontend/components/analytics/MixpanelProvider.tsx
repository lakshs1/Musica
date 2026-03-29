'use client';

import { useEffect } from 'react';

import { initializeAnalytics } from '@/lib/analytics';

export function MixpanelProvider() {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return null;
}
