from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from models.track import Track
from services.cache_service import CacheService
from services.youtube_service import YouTubeService

settings = get_settings()


class SearchService:
    def __init__(self) -> None:
        self.cache = CacheService()
        self.youtube = YouTubeService()

    async def search(self, db: AsyncSession, query: str) -> tuple[dict, str]:
        key = f"search:{query.lower().strip()}"
        stale_key = f"{key}:stale"

        async def refresh() -> dict:
            items = await self.youtube.search_music(query)
            await self._upsert_tracks(db, items)
            return {"query": query, "items": items}

        payload, source = await self.cache.get_or_swr(
            key=key,
            stale_key=stale_key,
            refresh_coro=refresh,
            ttl_seconds=settings.search_cache_ttl_seconds,
            stale_ttl_seconds=settings.stale_search_ttl_seconds,
        )

        return payload, source

    async def _upsert_tracks(self, db: AsyncSession, items: list[dict]) -> None:
        for item in items:
            track_stmt = select(Track).where(Track.youtube_id == item["youtube_id"])
            existing = (await db.execute(track_stmt)).scalar_one_or_none()
            if existing:
                existing.title = item["title"]
                existing.thumbnail = item["thumbnail"]
                existing.duration = item["duration"]
                continue

            db.add(
                Track(
                    youtube_id=item["youtube_id"],
                    title=item["title"],
                    thumbnail=item["thumbnail"],
                    duration=item["duration"],
                )
            )
        await db.commit()
