import { Suspense } from 'react';

import SearchPageClient from '@/app/search/SearchPageClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="py-10 text-center text-sm text-[#9aa7b4]">Loading search...</main>}>
      <SearchPageClient />
    </Suspense>
  );
}
