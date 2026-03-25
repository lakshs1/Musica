'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { Card } from '@/components/ui/Card';
import { useSearchStore } from '@/store/searchStore';

export default function SearchPage() {
  const params = useSearchParams();
  const setQuery = useSearchStore((state) => state.setQuery);

  useEffect(() => {
    setQuery(params.get('q') ?? '');
  }, [params, setQuery]);

  return (
    <main className="space-y-4">
      <h1 className="text-3xl text-[#e7f2ff] sm:text-4xl">Search tracks</h1>
      <Card>
        <div className="space-y-4">
          <SearchBar />
          <SearchResults />
        </div>
      </Card>
    </main>
  );
}
