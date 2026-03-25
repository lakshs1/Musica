export interface PlayableTrack {
  youtube_id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

export interface Track extends PlayableTrack {
  id: number;
}

export interface SearchResult extends PlayableTrack {}

export interface PlaylistMember {
  id: number;
  email: string;
  role: string;
}

export interface PlaylistTrack {
  id: number;
  position: number;
  track: Track;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  tracks: PlaylistTrack[];
  members: PlaylistMember[];
}

export interface PlaybackState {
  playlist_id: number;
  current_track: number | null;
  timestamp: number;
  is_playing: boolean;
}
