from core.config import get_settings
from services.youtube_service import YouTubeService

settings = get_settings()


class SearchService:
    def __init__(self) -> None:
        self.youtube = YouTubeService()

    async def search(self, query: str) -> tuple[dict, str]:
        items = await self.youtube.search_music(query)
        return {"query": query, "items": items}, "origin"

    async def recommendations(self) -> tuple[dict, str]:
        items = await self.youtube.get_music_recommendations()
        return {"items": items}, "origin"
