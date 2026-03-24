'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { usePlaylistStore } from '@/store/playlistStore';

export function PlaylistEditor({ playlistId }: { playlistId: number }) {
  const token = useAuthStore((state) => state.accessToken);
  const playlist = usePlaylistStore((state) => state.current);
  const fetchPlaylist = usePlaylistStore((state) => state.fetchPlaylist);
  const removeTrack = usePlaylistStore((state) => state.removeTrackOptimistic);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);

  useEffect(() => {
    if (!token) return;
    void fetchPlaylist(playlistId, token);
  }, [fetchPlaylist, playlistId, token]);

  useEffect(() => {
    if (!playlist) return;
    setQueue(playlist.tracks.map((item) => item.track));
  }, [playlist, setQueue]);

  if (!token) {
    return <p className="text-sm text-white/60">Login required to view playlist collaboration.</p>;
  }

  if (!playlist) {
    return <p className="text-sm text-white/60">Loading playlist...</p>;
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-white">{playlist.name}</h1>
        <p className="text-sm text-white/60">{playlist.description ?? 'Collaborative queue'}</p>
      </header>

      <ul className="space-y-2">
        {playlist.tracks.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <button
              onClick={() => void playTrack(playlist.id, item.track, token)}
              className="text-left"
            >
              <p className="text-sm font-medium text-white">{item.track.title}</p>
              <p className="text-xs text-white/50">{item.track.duration}</p>
            </button>
            <button
              onClick={() => void removeTrack(playlist.id, item.track.id, token)}
              className="rounded-xl border border-white/20 px-3 py-1 text-xs text-white/70"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
