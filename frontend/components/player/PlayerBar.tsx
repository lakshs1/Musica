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

  const queuePreview = useMemo(() => queue.slice(0, 3), [queue]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-[#8bb7ff4d] bg-[#02060dcc] px-3 py-3 backdrop-blur-xl sm:px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-[#e6f1ff]">{currentTrack?.title ?? 'Nothing playing'}</p>
          <p className="text-xs text-[#8fa7c3]">{isPlaying ? 'Playing' : 'Paused'} · {Math.floor(timestamp)}s</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="minimal-button-secondary" onClick={() => token && void pause(token)}>
            Pause
          </button>
          <input
            type="range"
            min={0}
            max={500}
            value={Math.min(500, Math.floor(timestamp))}
            onChange={(event) => token && void seek(Number(event.target.value), token)}
            className="h-1.5 w-full accent-[#7fb8ff] sm:w-44"
          />
        </div>

        <div className="hidden min-w-0 w-64 sm:block">
          <p className="mb-1 text-[11px] uppercase text-[#90a6c1]">Queue</p>
          <div className="space-y-1">
            {queuePreview.map((item) => (
              <p key={item.id} className="truncate text-xs text-[#c4dcf8]">
                {item.title}
              </p>
            ))}
            {!queuePreview.length && <p className="text-xs text-[#90a6c1]">No queued tracks.</p>}
          </div>
        </div>
      </div>
    </footer>
  );
}
