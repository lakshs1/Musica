from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.db import get_db
from models.track import Track
from schemas.track import TrackResponse
from services.cache_service import CacheService

settings = get_settings()
router = APIRouter(prefix="/tracks", tags=["tracks"])
cache = CacheService()


@router.get("/{id}", response_model=TrackResponse)
async def get_track(id: int, db: AsyncSession = Depends(get_db)) -> TrackResponse:
    cache_key = f"track:{id}"
    cached = await cache.get_json(cache_key)
    if cached:
        return TrackResponse(**cached)

    result = await db.execute(select(Track).where(Track.id == id))
    track = result.scalar_one_or_none()
    if track is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    payload = TrackResponse.model_validate(track).model_dump()
    await cache.set_json(cache_key, payload, settings.track_cache_ttl_seconds)
    return TrackResponse(**payload)
