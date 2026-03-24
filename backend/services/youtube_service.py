from typing import Any

import httpx

from core.config import get_settings

settings = get_settings()


class YouTubeService:
    def __init__(self) -> None:
        self.base_url = settings.youtube_base_url
        self.api_key = settings.youtube_api_key

    async def search_music(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=10) as client:
            search_response = await client.get(
                f"{self.base_url}/search",
                params={
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "maxResults": limit,
                    "videoCategoryId": "10",
                    "key": self.api_key,
                },
            )
            search_response.raise_for_status()
            search_payload = search_response.json()

            video_ids = [item["id"]["videoId"] for item in search_payload.get("items", [])]
            if not video_ids:
                return []

            details_response = await client.get(
                f"{self.base_url}/videos",
                params={
                    "part": "contentDetails,snippet",
                    "id": ",".join(video_ids),
                    "key": self.api_key,
                },
            )
            details_response.raise_for_status()
            details_payload = details_response.json()

        output: list[dict[str, Any]] = []
        for item in details_payload.get("items", []):
            snippet = item.get("snippet", {})
            thumbs = snippet.get("thumbnails", {})
            thumbnail_url = (
                thumbs.get("high", {}).get("url")
                or thumbs.get("medium", {}).get("url")
                or thumbs.get("default", {}).get("url")
                or ""
            )
            output.append(
                {
                    "youtube_id": item["id"],
                    "title": snippet.get("title", "Untitled"),
                    "thumbnail": thumbnail_url,
                    "duration": item.get("contentDetails", {}).get("duration", "PT0S"),
                }
            )

        return output
