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
      className="w-full rounded-xl border border-[#8bb7ff4d] bg-[#eaf3ff12] px-4 py-3 text-[#e7f2ff] outline-none transition placeholder:text-[#a8bbd6] focus:border-[#8bb7ffb3]"
    />
  );
}
