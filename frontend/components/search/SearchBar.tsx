'use client';

import { useEffect } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchStore } from '@/store/searchStore';

export function SearchBar() {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const runSearch = useSearchStore((state) => state.runSearch);

  const debouncedQuery = useDebouncedValue(query, 500);

  useEffect(() => {
    void runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  return (
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search songs, artists, or mood"
      className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/50"
    />
  );
}
