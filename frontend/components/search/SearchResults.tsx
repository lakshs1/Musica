'use client';

import Image from 'next/image';

import { Skeleton } from '@/components/ui/Skeleton';
import { useSearchStore } from '@/store/searchStore';

export function SearchResults({ onPick }: { onPick?: (youtubeId: string) => void }) {
  const { results, isLoading, source } = useSearchStore();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-white/50">Source: {source}</p>
      {results.map((track) => (
        <button
          key={track.youtube_id}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
          onClick={() => onPick?.(track.youtube_id)}
        >
          <Image src={track.thumbnail} alt={track.title} width={56} height={56} className="rounded-xl" />
          <div className="flex-1">
            <p className="line-clamp-1 text-sm font-medium text-white">{track.title}</p>
            <p className="text-xs text-white/50">{track.duration}</p>
          </div>
        </button>
      ))}
      {!results.length && <p className="py-6 text-center text-sm text-white/60">No tracks yet.</p>}
    </div>
  );
}
