'use client';

import { create } from 'zustand';

import type { PlayableTrack } from '@/types';

interface PlayerState {
  queue: PlayableTrack[];
  currentTrack: PlayableTrack | null;
  currentIndex: number;
  isPlaying: boolean;
  isExpanded: boolean;
  timestamp: number;
  pendingSeek: number | null;
  setQueue: (tracks: PlayableTrack[]) => void;
  playTrack: (track: PlayableTrack, queue?: PlayableTrack[]) => void;
  addToQueue: (track: PlayableTrack) => void;
  removeFromQueue: (track: PlayableTrack) => void;
  playNext: () => void;
  playPrevious: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  clearPendingSeek: () => void;
  openPlayer: () => void;
  closePlayer: () => void;
  setTimestamp: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  queue: [],
  currentTrack: null,
  currentIndex: -1,
  isPlaying: false,
  isExpanded: false,
  timestamp: 0,
  pendingSeek: null,
  setQueue: (tracks) =>
    set((state) => {
      const nextIndex = state.currentTrack
        ? tracks.findIndex((item) => item.youtube_id === state.currentTrack?.youtube_id)
        : -1;

      return {
        queue: tracks,
        currentIndex: nextIndex
      };
    }),
  playTrack: (track, queue) => {
    const nextQueue = queue ?? [track];
    const nextIndex = nextQueue.findIndex((item) => item.youtube_id === track.youtube_id);

    set({
      queue: nextQueue,
      currentTrack: track,
      currentIndex: nextIndex >= 0 ? nextIndex : 0,
      isPlaying: true,
      timestamp: 0,
      pendingSeek: 0
    });
  },
  addToQueue: (track) =>
    set((state) => ({
      queue: [...state.queue, track]
    })),
  removeFromQueue: (track) =>
    set((state) => {
      const removeIndex = state.queue.findIndex(
        (item, index) => item.youtube_id === track.youtube_id && (index === state.currentIndex || item.title === track.title)
      );

      if (removeIndex === -1) {
        return state;
      }

      const nextQueue = state.queue.filter((_, index) => index !== removeIndex);

      if (removeIndex !== state.currentIndex) {
        return {
          queue: nextQueue,
          currentIndex: removeIndex < state.currentIndex ? state.currentIndex - 1 : state.currentIndex
        };
      }

      if (!nextQueue.length) {
        return {
          queue: [],
          currentTrack: null,
          currentIndex: -1,
          isPlaying: false,
          timestamp: 0,
          pendingSeek: null
        };
      }

      const fallbackIndex = Math.min(removeIndex, nextQueue.length - 1);
      return {
        queue: nextQueue,
        currentTrack: nextQueue[fallbackIndex],
        currentIndex: fallbackIndex,
        isPlaying: true,
        timestamp: 0,
        pendingSeek: 0
      };
    }),
  playNext: () =>
    set((state) => {
      if (!state.queue.length) return state;
      const nextIndex = state.currentIndex >= 0 ? (state.currentIndex + 1) % state.queue.length : 0;
      return {
        currentTrack: state.queue[nextIndex],
        currentIndex: nextIndex,
        isPlaying: true,
        timestamp: 0,
        pendingSeek: 0
      };
    }),
  playPrevious: () =>
    set((state) => {
      if (!state.queue.length) return state;
      const previousIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.queue.length - 1;
      return {
        currentTrack: state.queue[previousIndex],
        currentIndex: previousIndex,
        isPlaying: true,
        timestamp: 0,
        pendingSeek: 0
      };
    }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  seek: (seconds) => set({ timestamp: seconds, pendingSeek: seconds }),
  clearPendingSeek: () => set({ pendingSeek: null }),
  openPlayer: () => set({ isExpanded: true }),
  closePlayer: () => set({ isExpanded: false }),
  setTimestamp: (seconds) => set({ timestamp: seconds })
}));
