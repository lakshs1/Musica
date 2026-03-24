from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.redis_client import redis
from models.playlist import Playlist, PlaylistMember, PlaylistTrack
from models.track import Track
from models.user import User


class PlaylistService:
    async def create_playlist(self, db: AsyncSession, owner: User, name: str, description: str | None) -> Playlist:
        playlist = Playlist(owner_id=owner.id, name=name, description=description)
        db.add(playlist)
        await db.flush()

        db.add(PlaylistMember(playlist_id=playlist.id, user_id=owner.id, role="owner"))
        await db.commit()
        await db.refresh(playlist)
        return playlist

    async def get_playlist(self, db: AsyncSession, playlist_id: int, user: User) -> Playlist:
        await self._ensure_member(db, playlist_id, user.id)
        stmt = select(Playlist).where(Playlist.id == playlist_id)
        playlist = (await db.execute(stmt)).scalar_one_or_none()
        if playlist is None:
            raise ValueError("Playlist not found")
        return playlist

    async def add_track(self, db: AsyncSession, playlist_id: int, track_id: int, user: User, position: int | None) -> PlaylistTrack:
        await self._ensure_member(db, playlist_id, user.id)
        track = (await db.execute(select(Track).where(Track.id == track_id))).scalar_one_or_none()
        if track is None:
            raise ValueError("Track not found")

        max_pos_stmt = select(func.max(PlaylistTrack.position)).where(PlaylistTrack.playlist_id == playlist_id)
        max_pos = (await db.execute(max_pos_stmt)).scalar_one_or_none()
        insert_position = position if position is not None else ((max_pos or 0) + 1)

        playlist_track = PlaylistTrack(playlist_id=playlist_id, track_id=track_id, position=insert_position)
        db.add(playlist_track)
        await db.commit()
        await db.refresh(playlist_track)

        await redis.publish(f"playlist:{playlist_id}:events", "track_added")
        return playlist_track

    async def remove_track(self, db: AsyncSession, playlist_id: int, track_id: int, user: User) -> None:
        await self._ensure_member(db, playlist_id, user.id)
        await db.execute(
            delete(PlaylistTrack).where(PlaylistTrack.playlist_id == playlist_id, PlaylistTrack.track_id == track_id)
        )
        await db.commit()
        await redis.publish(f"playlist:{playlist_id}:events", "track_removed")

    async def invite_member(self, db: AsyncSession, playlist_id: int, inviter: User, email: str, role: str) -> None:
        await self._ensure_member(db, playlist_id, inviter.id)
        user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if user is None:
            raise ValueError("Invitee does not exist")

        existing = (
            await db.execute(
                select(PlaylistMember).where(
                    PlaylistMember.playlist_id == playlist_id,
                    PlaylistMember.user_id == user.id,
                )
            )
        ).scalar_one_or_none()
        if existing:
            return

        db.add(PlaylistMember(playlist_id=playlist_id, user_id=user.id, role=role))
        await db.commit()
        await redis.publish(f"playlist:{playlist_id}:events", "member_invited")

    async def list_members(self, db: AsyncSession, playlist_id: int, requester: User) -> list[PlaylistMember]:
        await self._ensure_member(db, playlist_id, requester.id)
        result = await db.execute(select(PlaylistMember).where(PlaylistMember.playlist_id == playlist_id))
        return list(result.scalars().all())

    async def _ensure_member(self, db: AsyncSession, playlist_id: int, user_id: int) -> None:
        result = await db.execute(
            select(PlaylistMember).where(PlaylistMember.playlist_id == playlist_id, PlaylistMember.user_id == user_id)
        )
        if result.scalar_one_or_none() is None:
            raise PermissionError("User is not a member of this playlist")
