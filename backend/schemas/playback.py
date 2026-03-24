from pydantic import BaseModel, Field


class PlaybackActionRequest(BaseModel):
    track_id: int | None = None
    timestamp: float = Field(default=0, ge=0)


class PlaybackStateResponse(BaseModel):
    playlist_id: int
    current_track: int | None
    timestamp: float
    is_playing: bool
