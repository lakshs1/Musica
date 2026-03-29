'use client';

import { useMemo } from 'react';

import { AppLogo } from '@/components/AppLogo';
import { trimTrackTitle } from '@/lib/track-display';
import { usePlayerStore } from '@/store/playerStore';

export function PlayerBar() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const timestamp = usePlayerStore((state) => state.timestamp);
  const queue = usePlayerStore((state) => state.queue);
  const seek = usePlayerStore((state) => state.seek);
  const pause = usePlayerStore((state) => state.pause);
  const resume = usePlayerStore((state) => state.resume);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const openPlayer = usePlayerStore((state) => state.openPlayer);

  const queuePreview = useMemo(() => queue.slice(0, 3), [queue]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 px-3 py-3 sm:px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex w-full flex-col gap-3 rounded-[1.7rem] border border-white/10 bg-[rgba(4,4,4,0.92)] px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4">
          <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={openPlayer}>
            <AppLogo size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#f6f8fc]">{currentTrack ? trimTrackTitle(currentTrack.title) : 'Nothing playing'}</p>
              <p className="text-xs text-[#8fa7c3]">{isPlaying ? 'Playing now' : 'Paused'} · {Math.floor(timestamp)}s</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button className="minimal-button-secondary" onClick={() => playPrevious()}>
              Prev
            </button>
            <button
              className="minimal-button-secondary"
              onClick={(event) => {
                event.stopPropagation();
                if (isPlaying) {
                  pause();
                  return;
                }
                resume();
              }}
            >
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
            <button className="minimal-button-secondary" onClick={() => playNext()}>
              Next
            </button>
            <input
              type="range"
              min={0}
              max={500}
              value={Math.min(500, Math.floor(timestamp))}
              onChange={(event) => seek(Number(event.target.value))}
              className="h-1.5 w-full accent-[#ffd400] sm:w-44"
            />
          </div>

          <div className="hidden min-w-0 w-64 sm:block">
            <p className="mb-1 text-[11px] uppercase text-[#90a6c1]">Queue</p>
            <div className="space-y-1">
              {queuePreview.map((item) => (
                <button
                  key={item.youtube_id}
                  className="block truncate text-left text-xs text-[#c4dcf8]"
                  onClick={() =>
                    playTrack(item, queue, {
                      source: 'player_bar_queue',
                      initiatedBy: 'queue_preview'
                    })
                  }
                >
                  {trimTrackTitle(item.title)}
                </button>
              ))}
              {!queuePreview.length && <p className="text-xs text-[#90a6c1]">No queued tracks.</p>}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
