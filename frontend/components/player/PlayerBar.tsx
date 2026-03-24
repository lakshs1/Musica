'use client';

import { useMemo } from 'react';

import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';

export function PlayerBar() {
  const token = useAuthStore((state) => state.accessToken);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const timestamp = usePlayerStore((state) => state.timestamp);
  const queue = usePlayerStore((state) => state.queue);
  const seek = usePlayerStore((state) => state.seek);
  const pause = usePlayerStore((state) => state.pause);

  const queuePreview = useMemo(() => queue.slice(0, 4), [queue]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-ink/80 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{currentTrack?.title ?? 'Nothing playing'}</p>
          <p className="text-xs text-white/50">{isPlaying ? 'Playing' : 'Paused'} · {Math.floor(timestamp)}s</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-white/20 px-3 py-2 text-xs text-white"
            onClick={() => token && void pause(token)}
          >
            Pause
          </button>
          <input
            type="range"
            min={0}
            max={500}
            value={Math.min(500, Math.floor(timestamp))}
            onChange={(event) => token && void seek(Number(event.target.value), token)}
            className="w-28"
          />
        </div>

        <div className="hidden min-w-0 w-64 md:block">
          <p className="mb-1 text-[11px] uppercase text-white/40">Queue</p>
          <div className="space-y-1">
            {queuePreview.map((item) => (
              <p key={item.id} className="truncate text-xs text-white/70">
                {item.title}
              </p>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
