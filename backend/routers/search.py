from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.db import get_db
from core.rate_limit import enforce_rate_limit
from schemas.search import SearchResponse
from services.search_service import SearchService

router = APIRouter(tags=["search"])
service = SearchService()


@router.get("/search", response_model=SearchResponse)
async def search_tracks(
    request: Request,
    q: str = Query(..., min_length=2, max_length=120),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    await enforce_rate_limit(request)
    payload, source = await service.search(db, q)
    return SearchResponse(query=payload["query"], items=payload["items"], source=source)
