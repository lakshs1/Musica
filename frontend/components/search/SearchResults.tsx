'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { trimTrackTitle } from '@/lib/track-display';
import type { PlayableTrack } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { useSearchStore } from '@/store/searchStore';

export function SearchResults({ onPick }: { onPick?: (youtubeId: string) => void }) {
  const { results, isLoading, source } = useSearchStore();
  const playTrack = usePlayerStore((state) => state.playTrack);
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const queue: PlayableTrack[] = results.map((track) => ({
    youtube_id: track.youtube_id,
    title: track.title,
    thumbnail: track.thumbnail,
    duration: track.duration
  }));

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
        <div key={track.youtube_id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:bg-white/[0.05]">
          <button
            className="min-w-0 flex-1 text-left"
            onClick={() => {
              onPick?.(track.youtube_id);
              playTrack(
                {
                  youtube_id: track.youtube_id,
                  title: track.title,
                  thumbnail: track.thumbnail,
                  duration: track.duration
                },
                queue
              );
            }}
          >
            <p className="line-clamp-1 text-sm text-[#f5f7fb]">{trimTrackTitle(track.title)}</p>
            <p className="mt-1 text-xs text-[#9aa7b4]">{track.duration}</p>
          </button>
          <div className="flex items-center gap-2">
            <button
              className="minimal-button-secondary"
              onClick={() =>
                addToQueue({
                  youtube_id: track.youtube_id,
                  title: track.title,
                  thumbnail: track.thumbnail,
                  duration: track.duration
                })
              }
            >
              Add to queue
            </button>
          </div>
        </div>
      ))}
      {!results.length && <p className="py-6 text-center text-sm text-[#a8bbd6]">No tracks yet.</p>}
    </div>
  );
}
