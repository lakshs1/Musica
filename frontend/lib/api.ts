import { env } from '@/lib/env';
import type { PlaybackState, Playlist, SearchResult, Track } from '@/types';

interface SearchResponse {
  query: string;
  items: SearchResult[];
  source: string;
}

interface RecommendationsResponse {
  items: SearchResult[];
  source: string;
}

interface TrackSongPlayedPayload {
  distinct_id?: string;
  session_id?: string;
  session_started_at?: string;
  session_elapsed_seconds?: number;
  session_play_count?: number;
  playlist_id?: number;
  track_id?: number;
  youtube_id: string;
  title: string;
  duration: string;
  source?: string;
  initiated_by?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API error ${response.status}: ${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  search: (q: string) => request<SearchResponse>(`/search?q=${encodeURIComponent(q)}`),
  recommendations: () => request<RecommendationsResponse>('/recommendations'),
  getTrack: (id: number) => request<Track>(`/tracks/${id}`),
  createPlaylist: (name: string, description?: string, token?: string) =>
    request<Playlist>('/playlists', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify({ name, description })
    }),
  getPlaylist: (id: number, token: string) =>
    request<Playlist>(`/playlists/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  addTrack: (playlistId: number, trackId: number, token: string) =>
    request<{ playlist_track_id: number; track_id: number; position: number }>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ track_id: trackId })
    }),
  removeTrack: (playlistId: number, trackId: number, token: string) =>
    request<void>(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),
  inviteMember: (playlistId: number, email: string, token: string) =>
    request<{ status: string }>(`/playlists/${playlistId}/invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email })
    }),
  getMembers: (playlistId: number, token: string) =>
    request<Playlist['members']>(`/playlists/${playlistId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  play: (playlistId: number, trackId: number, timestamp: number, token: string) =>
    request<PlaybackState>(`/playlists/${playlistId}/play`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ track_id: trackId, timestamp })
    }),
  pause: (playlistId: number, timestamp: number, token: string) =>
    request<PlaybackState>(`/playlists/${playlistId}/pause`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ timestamp })
    }),
  seek: (playlistId: number, timestamp: number, token: string) =>
    request<PlaybackState>(`/playlists/${playlistId}/seek`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ timestamp })
    }),
  trackSongPlayed: (payload: TrackSongPlayedPayload) =>
    request<{ status: string }>('/analytics/song-played', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
