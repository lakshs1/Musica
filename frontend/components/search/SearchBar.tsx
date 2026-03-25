'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchStore } from '@/store/searchStore';

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const runSearch = useSearchStore((state) => state.runSearch);

  const debouncedQuery = useDebouncedValue(query, 500);

  useEffect(() => {
    void runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const nextQuery = debouncedQuery.trim();
    const currentQuery = searchParams.get('q') ?? '';

    if (nextQuery) {
      params.set('q', nextQuery);
    } else {
      params.delete('q');
    }

    if (currentQuery === nextQuery) {
      return;
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  return (
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search songs, artists, or mood"
      className="w-full rounded-xl border border-[#8bb7ff4d] bg-[#eaf3ff12] px-4 py-3 text-[#e7f2ff] outline-none transition placeholder:text-[#a8bbd6] focus:border-[#8bb7ffb3]"
    />
  );
}
