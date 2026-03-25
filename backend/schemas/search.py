from pydantic import BaseModel


class SearchItem(BaseModel):
    youtube_id: str
    title: str
    thumbnail: str
    duration: str


class SearchResponse(BaseModel):
    query: str
    items: list[SearchItem]
    source: str


class RecommendationsResponse(BaseModel):
    items: list[SearchItem]
    source: str
