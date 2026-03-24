'use client';

import { create } from 'zustand';

import { api } from '@/lib/api';
import type { Playlist } from '@/types';

interface PlaylistState {
  current: Playlist | null;
  isLoading: boolean;
  optimisticTrackIds: number[];
  fetchPlaylist: (playlistId: number, token: string) => Promise<void>;
  addTrackOptimistic: (playlistId: number, trackId: number, token: string) => Promise<void>;
  removeTrackOptimistic: (playlistId: number, trackId: number, token: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  current: null,
  isLoading: false,
  optimisticTrackIds: [],
  fetchPlaylist: async (playlistId, token) => {
    set({ isLoading: true });
    const playlist = await api.getPlaylist(playlistId, token);
    set({ current: playlist, isLoading: false });
  },
  addTrackOptimistic: async (playlistId, trackId, token) => {
    const current = get().current;
    if (!current) return;

    set({ optimisticTrackIds: [...get().optimisticTrackIds, trackId] });

    try {
      await api.addTrack(playlistId, trackId, token);
      await get().fetchPlaylist(playlistId, token);
    } finally {
      set({ optimisticTrackIds: get().optimisticTrackIds.filter((id) => id !== trackId) });
    }
  },
  removeTrackOptimistic: async (playlistId, trackId, token) => {
    const current = get().current;
    if (!current) return;

    const nextTracks = current.tracks.filter((item) => item.track.id !== trackId);
    set({ current: { ...current, tracks: nextTracks } });

    try {
      await api.removeTrack(playlistId, trackId, token);
    } catch {
      await get().fetchPlaylist(playlistId, token);
    }
  }
}));
