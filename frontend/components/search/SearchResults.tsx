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
      <p className="text-xs uppercase tracking-wide text-[#9ab3d1]">Source: {source}</p>
      {results.map((track) => (
        <button
          key={track.youtube_id}
          className="flex w-full items-center gap-3 rounded-xl border border-[#8bb7ff33] bg-[#0a1425] p-3 text-left transition hover:bg-[#10203a]"
          onClick={() => onPick?.(track.youtube_id)}
        >
          <Image src={track.thumbnail} alt={track.title} width={56} height={56} className="rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm text-[#e5f1ff]">{track.title}</p>
            <p className="text-xs text-[#8fa7c3]">{track.duration}</p>
          </div>
        </button>
      ))}
      {!results.length && <p className="py-6 text-center text-sm text-[#a8bbd6]">No tracks yet.</p>}
    </div>
  );
}
