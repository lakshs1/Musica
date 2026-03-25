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
    return <p className="text-sm text-[#a8bbd6]">Login required to view playlist collaboration.</p>;
  }

  if (!playlist) {
    return <p className="text-sm text-[#a8bbd6]">Loading playlist...</p>;
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-3xl text-[#e7f2ff]">{playlist.name}</h1>
        <p className="text-sm text-[#9ab3d1]">{playlist.description ?? 'Collaborative queue'}</p>
      </header>

      <ul className="space-y-2">
        {playlist.tracks.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 rounded-xl border border-[#8bb7ff33] bg-[#0a1425] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={() => void playTrack(playlist.id, item.track, token)} className="text-left">
              <p className="text-sm text-[#e7f2ff]">{item.track.title}</p>
              <p className="text-xs text-[#8fa7c3]">{item.track.duration}</p>
            </button>
            <button onClick={() => void removeTrack(playlist.id, item.track.id, token)} className="minimal-button-secondary self-start sm:self-auto">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
