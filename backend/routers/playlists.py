from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.db import get_db
from core.security import get_current_user
from models.playlist import PlaylistMember, PlaylistTrack
from models.track import Track
from models.user import User
from schemas.playlist import (
    AddTrackRequest,
    CreatePlaylistRequest,
    InviteMemberRequest,
    PlaylistMemberResponse,
    PlaylistResponse,
    PlaylistTrackResponse,
)
from schemas.track import TrackResponse
from services.playlist_service import PlaylistService

router = APIRouter(prefix="/playlists", tags=["playlists", "collaboration"])
service = PlaylistService()


@router.post("", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
async def create_playlist(
    payload: CreatePlaylistRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PlaylistResponse:
    playlist = await service.create_playlist(db, current_user, payload.name, payload.description)
    return PlaylistResponse(
        id=playlist.id,
        name=playlist.name,
        description=playlist.description,
        owner_id=playlist.owner_id,
        tracks=[],
        members=[PlaylistMemberResponse(id=current_user.id, email=current_user.email, role="owner")],
    )


@router.get("/{id}", response_model=PlaylistResponse)
async def get_playlist(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PlaylistResponse:
    try:
        playlist = await service.get_playlist(db, id, current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    track_rows = await db.execute(
        select(PlaylistTrack, Track)
        .join(Track, PlaylistTrack.track_id == Track.id)
        .where(PlaylistTrack.playlist_id == id)
        .order_by(PlaylistTrack.position.asc())
    )
    member_rows = await db.execute(
        select(PlaylistMember, User).join(User, PlaylistMember.user_id == User.id).where(PlaylistMember.playlist_id == id)
    )

    tracks = [
        PlaylistTrackResponse(
            id=playlist_track.id,
            position=playlist_track.position,
            track=TrackResponse.model_validate(track),
        )
        for playlist_track, track in track_rows.all()
    ]
    members = [
        PlaylistMemberResponse(id=user.id, email=user.email, role=member.role)
        for member, user in member_rows.all()
    ]

    return PlaylistResponse(
        id=playlist.id,
        name=playlist.name,
        description=playlist.description,
        owner_id=playlist.owner_id,
        tracks=tracks,
        members=members,
    )


@router.post("/{id}/tracks", status_code=status.HTTP_201_CREATED)
async def add_track(
    id: int,
    payload: AddTrackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    try:
        row = await service.add_track(db, id, payload.track_id, current_user, payload.position)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return {"playlist_track_id": row.id, "track_id": row.track_id, "position": row.position}


@router.delete("/{id}/tracks/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_track(
    id: int,
    track_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        await service.remove_track(db, id, track_id, current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.post("/{id}/invite", status_code=status.HTTP_202_ACCEPTED)
async def invite_member(
    id: int,
    payload: InviteMemberRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    try:
        await service.invite_member(db, id, current_user, payload.email, payload.role)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return {"status": "invited"}


@router.get("/{id}/members", response_model=list[PlaylistMemberResponse])
async def list_members(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PlaylistMemberResponse]:
    try:
        members = await service.list_members(db, id, current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    user_map = {
        user.id: user.email
        for user in (
            await db.execute(select(User).where(User.id.in_([member.user_id for member in members])))
        ).scalars()
    }
    return [PlaylistMemberResponse(id=m.user_id, email=user_map.get(m.user_id, ""), role=m.role) for m in members]
