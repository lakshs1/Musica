'use client';

import { AppLogo } from '@/components/AppLogo';
import { trimTrackTitle } from '@/lib/track-display';
import { usePlayerStore } from '@/store/playerStore';

export function PlayerPanel() {
  const isExpanded = usePlayerStore((state) => state.isExpanded);
  const closePlayer = usePlayerStore((state) => state.closePlayer);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const queue = usePlayerStore((state) => state.queue);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const timestamp = usePlayerStore((state) => state.timestamp);
  const pause = usePlayerStore((state) => state.pause);
  const resume = usePlayerStore((state) => state.resume);
  const seek = usePlayerStore((state) => state.seek);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);

  if (!isExpanded) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-24 pt-8 backdrop-blur-xl sm:items-center sm:px-6 sm:pb-8" onClick={closePlayer}>
      <section
        className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid gap-0 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="relative flex min-h-[360px] flex-col justify-between bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),linear-gradient(145deg,#ffd400_0%,#ff6b00_36%,#ff1f57_78%,#7a00ff_100%)] p-6 sm:min-h-[430px] sm:p-8">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-white/90">
                Now Playing
              </span>
              <button className="rounded-full bg-black/20 px-4 py-2 text-sm text-white/90 transition hover:bg-black/30" onClick={closePlayer}>
                Close
              </button>
            </div>

            <div className="space-y-5">
              <div className="inline-flex rounded-[2rem] bg-black/18 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                <AppLogo size={180} />
              </div>
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Musica Cover</p>
                <h2 className="mt-3 text-3xl leading-tight text-white sm:text-5xl">
                  {currentTrack ? trimTrackTitle(currentTrack.title) : 'Nothing queued yet'}
                </h2>
                <p className="mt-3 text-sm text-white/78">
                  {currentTrack ? 'Tap the controls below or jump into the queue on the right.' : 'Pick any recommendation or search result to start playing instantly.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 bg-black/70 p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-[#9bb0c7]">Playback</p>
                <span className="text-sm text-[#d5dce5]">{Math.floor(timestamp)}s</span>
              </div>

              <input
                type="range"
                min={0}
                max={500}
                value={Math.min(500, Math.floor(timestamp))}
                onChange={(event) => seek(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#ffd400]"
              />

              <div className="flex flex-wrap gap-3">
                <button className="minimal-button-secondary" onClick={playPrevious}>
                  Previous
                </button>
                <button className="minimal-button" onClick={() => (isPlaying ? pause() : resume())}>
                  {isPlaying ? 'Pause track' : 'Resume track'}
                </button>
                {currentTrack ? (
                  <button
                    className="minimal-button-secondary"
                    onClick={() =>
                      playTrack(currentTrack, queue, {
                        source: 'player_panel',
                        initiatedBy: 'restart_button'
                      })
                    }
                  >
                    Restart song
                  </button>
                ) : null}
                <button className="minimal-button-secondary" onClick={playNext}>
                  Next
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.28em] text-[#9bb0c7]">Queue</p>
                <span className="text-sm text-[#c9d0d9]">{queue.length} songs</span>
              </div>

              <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={`${item.youtube_id}-${item.title}`}
                    className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]"
                  >
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() =>
                        playTrack(item, queue, {
                          source: 'player_panel_queue',
                          initiatedBy: 'queue_item'
                        })
                      }
                    >
                      <span className="block truncate text-sm text-[#f5f7fb]">{trimTrackTitle(item.title)}</span>
                      <span className="mt-1 block text-xs text-[#95a1af]">{item.duration}</span>
                    </button>
                    <button
                      className="rounded-full bg-black/20 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-[#ffd760] transition hover:bg-black/30"
                      onClick={() => removeFromQueue(item)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {!queue.length ? <p className="text-sm text-[#95a1af]">Your queue will appear here.</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
