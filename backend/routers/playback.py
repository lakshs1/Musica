from fastapi import APIRouter, Depends

from core.security import get_current_user
from models.user import User
from schemas.playback import PlaybackActionRequest, PlaybackStateResponse
from services.playback_service import PlaybackService

router = APIRouter(prefix="/playlists", tags=["playback"])
service = PlaybackService()


@router.post("/{id}/play", response_model=PlaybackStateResponse)
async def play(
    id: int,
    payload: PlaybackActionRequest,
    current_user: User = Depends(get_current_user),
) -> PlaybackStateResponse:
    _ = current_user
    state = await service.play(id, payload.track_id, payload.timestamp)
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
