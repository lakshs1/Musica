from pydantic import BaseModel, Field


class PlaybackActionRequest(BaseModel):
    track_id: int | None = None
    youtube_id: str | None = None
    title: str | None = None
    source: str | None = None
    session_id: str | None = None
    session_started_at: str | None = None
    session_elapsed_seconds: int | None = None
    session_play_count: int | None = None
    timestamp: float = Field(default=0, ge=0)


class PlaybackStateResponse(BaseModel):
    playlist_id: int
    current_track: int | None
    timestamp: float
    is_playing: bool
