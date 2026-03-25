from fastapi import APIRouter, Query, Request
from schemas.search import RecommendationsResponse, SearchResponse
from services.search_service import SearchService

router = APIRouter(tags=["search"])
service = SearchService()


@router.get("/search", response_model=SearchResponse)
async def search_tracks(
    request: Request,
    q: str = Query(..., min_length=2, max_length=120),
) -> SearchResponse:
    payload, source = await service.search(q)
    return SearchResponse(query=payload["query"], items=payload["items"], source=source)


@router.get("/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(request: Request) -> RecommendationsResponse:
    payload, source = await service.recommendations()
    return RecommendationsResponse(items=payload["items"], source=source)
