'use client';

import { useEffect, useState } from 'react';

import { AppLogo } from '@/components/AppLogo';
import { trimTrackTitle } from '@/lib/track-display';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/store/playerStore';
import type { PlayableTrack, SearchResult } from '@/types';

interface RecommendationsState {
  items: SearchResult[];
  source: string;
  isLoading: boolean;
  error: string | null;
}

function buildCoverMeta(title: string) {
  const lower = title.toLowerCase();

  if (lower.includes('jazz') || lower.includes('soul') || lower.includes('blues')) {
    return {
      type: 'Night Jazz',
      vibe: 'Smoky, velvet, after-hours',
      art: 'linear-gradient(160deg, #140f0f 0%, #2e1c18 42%, #76553a 100%)'
    };
  }

  if (lower.includes('rock') || lower.includes('metal') || lower.includes('guitar')) {
    return {
      type: 'Arena Energy',
      vibe: 'Sharp riffs, midnight drive',
      art: 'linear-gradient(160deg, #050505 0%, #191919 36%, #5d6d7a 100%)'
    };
  }

  if (lower.includes('pop') || lower.includes('top') || lower.includes('hit')) {
    return {
      type: 'Pop Radar',
      vibe: 'Bright hooks, chart heat',
      art: 'linear-gradient(160deg, #050505 0%, #152031 38%, #7cb7ff 100%)'
    };
  }

  if (lower.includes('lofi') || lower.includes('lo-fi') || lower.includes('chill')) {
    return {
      type: 'Quiet Drift',
      vibe: 'Soft loops, calm motion',
      art: 'linear-gradient(160deg, #060606 0%, #132034 45%, #526f8d 100%)'
    };
  }

  if (lower.includes('ambient') || lower.includes('focus') || lower.includes('study')) {
    return {
      type: 'Deep Focus',
      vibe: 'Still air, long concentration',
      art: 'linear-gradient(160deg, #040404 0%, #0a1b24 45%, #5d7d88 100%)'
    };
  }

  return {
    type: 'Open Wave',
    vibe: 'Fresh finds, wide-screen mood',
    art: 'linear-gradient(160deg, #0b0b0b 0%, #ff6b00 32%, #ffef00 100%)'
  };
}

const brightPalettes = [
  'linear-gradient(155deg, #ffec00 0%, #ff9a00 48%, #ff4d00 100%)',
  'linear-gradient(155deg, #ff285e 0%, #ff7a00 42%, #ffd000 100%)',
  'linear-gradient(155deg, #00f0ff 0%, #00c2ff 35%, #8f5bff 100%)',
  'linear-gradient(155deg, #67ff3f 0%, #00d68f 38%, #00a8ff 100%)',
  'linear-gradient(155deg, #ff4f4f 0%, #ff2ad4 40%, #8a2cff 100%)',
  'linear-gradient(155deg, #fff35c 0%, #62ffb0 36%, #00b8ff 100%)'
];

export function RecommendationsFeed() {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const [state, setState] = useState<RecommendationsState>({
    items: [],
    source: 'none',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await api.recommendations();
        if (cancelled) return;
        setState({
          items: response.items,
          source: response.source,
          isLoading: false,
          error: null
        });
      } catch (error) {
        if (cancelled) return;
        setState((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load recommendations.'
        }));
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.isLoading) {
    return <p className="text-sm text-[#9ab3d1]">Loading music feed...</p>;
  }

  if (state.error) {
    return <p className="text-sm text-[#ffb4b4]">{state.error}</p>;
  }

  const queue: PlayableTrack[] = state.items.map((item) => ({
    youtube_id: item.youtube_id,
    title: item.title,
    thumbnail: item.thumbnail,
    duration: item.duration
  }));

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[#8ca1ba]">Source: {state.source}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {state.items.map((item) => {
          const cover = buildCoverMeta(item.title);
          const palette = brightPalettes[Math.abs(item.youtube_id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % brightPalettes.length];

          return (
            <li key={item.youtube_id} className="min-w-0">
              <div
                className="group overflow-hidden rounded-[1.45rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1"
                style={{
                  backgroundImage: `${palette}, radial-gradient(circle at top left, rgba(255,255,255,0.14), transparent 30%)`
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    playTrack(
                      {
                        youtube_id: item.youtube_id,
                        title: item.title,
                        thumbnail: item.thumbnail,
                        duration: item.duration
                      },
                      queue
                    )
                  }
                  className="flex aspect-[0.92/1] w-full flex-col justify-between p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/95">
                      {cover.type}
                    </span>
                    <AppLogo size={38} />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.26em] text-white/75">{cover.vibe}</p>
                      <h3 className="mt-2 line-clamp-2 text-2xl leading-tight text-white">{trimTrackTitle(item.title)}</h3>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/78">
                      <span>{item.duration}</span>
                      <span className="transition group-hover:translate-x-1">Play now</span>
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2 border-t border-black/10 bg-black/18 px-4 pb-3 pt-3">
                  <button
                    className="rounded-full bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-black/30"
                    onClick={() =>
                      playTrack(
                        {
                          youtube_id: item.youtube_id,
                          title: item.title,
                          thumbnail: item.thumbnail,
                          duration: item.duration
                        },
                        queue
                      )
                    }
                  >
                    Play
                  </button>
                  <button
                    className="rounded-full bg-white/18 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-white/28"
                    onClick={() =>
                      addToQueue({
                        youtube_id: item.youtube_id,
                        title: item.title,
                        thumbnail: item.thumbnail,
                        duration: item.duration
                      })
                    }
                  >
                    Add to queue
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {!state.items.length && <p className="py-6 text-center text-sm text-[#a8bbd6]">No tracks yet.</p>}
    </div>
  );
}
