'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/store/authStore';

export function AppBootstrap() {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    void init();
  }, [init]);

  return null;
}
