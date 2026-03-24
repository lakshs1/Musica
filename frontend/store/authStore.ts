'use client';

import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

interface AuthState {
  accessToken: string | null;
  userEmail: string | null;
  isLoading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userEmail: null,
  isLoading: false,
  init: async () => {
    set({ isLoading: true });
    const { data } = await supabase.auth.getSession();
    set({
      accessToken: data.session?.access_token ?? null,
      userEmail: data.session?.user?.email ?? null,
      isLoading: false
    });
  },
  login: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ accessToken: data.session.access_token, userEmail: data.user.email ?? null, isLoading: false });
  },
  signup: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    set({ accessToken: data.session?.access_token ?? null, userEmail: data.user?.email ?? null, isLoading: false });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ accessToken: null, userEmail: null });
  }
}));
