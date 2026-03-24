'use client';

import { create } from 'zustand';

import { api } from '@/lib/api';
import type { Track } from '@/types';

interface PlayerState {
  queue: Track[];
  currentTrack: Track | null;
  playlistId: number | null;
  isPlaying: boolean;
  timestamp: number;
  setQueue: (tracks: Track[]) => void;
  playTrack: (playlistId: number, track: Track, token: string) => Promise<void>;
  pause: (token: string) => Promise<void>;
  seek: (seconds: number, token: string) => Promise<void>;
  setTimestamp: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentTrack: null,
  playlistId: null,
  isPlaying: false,
  timestamp: 0,
  setQueue: (tracks) => set({ queue: tracks }),
  playTrack: async (playlistId, track, token) => {
    const state = await api.play(playlistId, track.id, get().timestamp, token);
    set({
      playlistId,
      currentTrack: track,
      isPlaying: state.is_playing,
      timestamp: state.timestamp
    });
  },
  pause: async (token) => {
    const playlistId = get().playlistId;
    if (!playlistId) return;
    const state = await api.pause(playlistId, get().timestamp, token);
    set({ isPlaying: state.is_playing, timestamp: state.timestamp });
  },
  seek: async (seconds, token) => {
    const playlistId = get().playlistId;
    if (!playlistId) return;
    const state = await api.seek(playlistId, seconds, token);
    set({ timestamp: state.timestamp });
  },
  setTimestamp: (seconds) => set({ timestamp: seconds })
}));
