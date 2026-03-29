from pydantic import BaseModel


class SongPlayedEventRequest(BaseModel):
    distinct_id: str | None = None
    session_id: str | None = None
    session_started_at: str | None = None
    session_elapsed_seconds: int | None = None
    session_play_count: int | None = None
    playlist_id: int | None = None
    track_id: int | None = None
    youtube_id: str
    title: str
    duration: str
    source: str | None = None
    initiated_by: str | None = None


class AnalyticsTrackResponse(BaseModel):
    status: str
