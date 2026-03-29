from fastapi import APIRouter, Depends

from core.security import get_current_user
from models.user import User
from schemas.playback import PlaybackActionRequest, PlaybackStateResponse
from services.analytics_service import analytics
from services.playback_service import PlaybackService

router = APIRouter(prefix="/playlists", tags=["playback"])
service = PlaybackService()


@router.post("/{id}/play", response_model=PlaybackStateResponse)
async def play(
    id: int,
    payload: PlaybackActionRequest,
    current_user: User = Depends(get_current_user),
) -> PlaybackStateResponse:
    state = await service.play(id, payload.track_id, payload.timestamp)
    analytics.track_song_play(
        current_user,
        playlist_id=id,
        track_id=payload.track_id,
        timestamp=payload.timestamp,
        properties={
            "title": payload.title,
            "youtube_id": payload.youtube_id,
            "client_source": payload.source,
            "session_id": payload.session_id,
            "session_started_at": payload.session_started_at,
            "session_elapsed_seconds": payload.session_elapsed_seconds,
            "session_play_count": payload.session_play_count,
        },
    )
    return PlaybackStateResponse(**state)


@router.post("/{id}/pause", response_model=PlaybackStateResponse)
async def pause(
    id: int,
    payload: PlaybackActionRequest,
    current_user: User = Depends(get_current_user),
) -> PlaybackStateResponse:
    _ = current_user
    state = await service.pause(id, payload.timestamp)
    return PlaybackStateResponse(**state)


@router.post("/{id}/seek", response_model=PlaybackStateResponse)
async def seek(
    id: int,
    payload: PlaybackActionRequest,
    current_user: User = Depends(get_current_user),
) -> PlaybackStateResponse:
    _ = current_user
    state = await service.seek(id, payload.timestamp)
    return PlaybackStateResponse(**state)
