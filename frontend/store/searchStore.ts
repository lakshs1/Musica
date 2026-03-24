'use client';

import { create } from 'zustand';

import { api } from '@/lib/api';
import type { SearchResult } from '@/types';

interface SearchState {
  query: string;
  source: string;
  isLoading: boolean;
  results: SearchResult[];
  setQuery: (query: string) => void;
  runSearch: (query: string) => Promise<void>;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  source: 'none',
  isLoading: false,
  results: [],
  setQuery: (query) => set({ query }),
  runSearch: async (query) => {
    if (!query.trim()) {
      set({ results: [], source: 'none' });
      return;
    }

    set({ isLoading: true });
    const response = await api.search(query);
    set({ results: response.items, source: response.source, isLoading: false });
  }
}));
