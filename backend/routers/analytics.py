from fastapi import APIRouter

from schemas.analytics import AnalyticsTrackResponse, SongPlayedEventRequest
from services.analytics_service import analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/song-played", response_model=AnalyticsTrackResponse)
async def track_song_played(payload: SongPlayedEventRequest) -> AnalyticsTrackResponse:
    analytics.track(
        payload.distinct_id or f"anonymous::{payload.youtube_id}",
        "song_played",
        {
            "source": "backend_proxy",
            "client_source": payload.source,
            "initiated_by": payload.initiated_by,
            "session_id": payload.session_id,
            "session_started_at": payload.session_started_at,
            "session_elapsed_seconds": payload.session_elapsed_seconds,
            "session_play_count": payload.session_play_count,
            "playlist_id": payload.playlist_id,
            "track_id": payload.track_id,
            "youtube_id": payload.youtube_id,
            "title": payload.title,
            "duration": payload.duration,
        },
    )
    return AnalyticsTrackResponse(status="queued")
