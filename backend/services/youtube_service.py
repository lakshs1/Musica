import re
from typing import Any

import httpx

from core.config import get_settings

settings = get_settings()


class YouTubeService:
    curated_recommendation_queries = (
        "Arijit Singh official audio",
        "Shreya Ghoshal official audio",
        "Pritam official audio",
        "A.R. Rahman official audio",
        "Anirudh Ravichander official audio",
        "Atif Aslam official audio",
        "Taylor Swift official audio",
        "Ed Sheeran official audio",
        "The Weeknd official audio",
        "Dua Lipa official audio",
        "Ariana Grande official audio",
        "Billie Eilish official audio",
    )

    def __init__(self) -> None:
        self.base_url = settings.youtube_base_url
        self.api_key = settings.youtube_api_key

    async def search_music(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        search_query = self._build_search_query(query)

        async with httpx.AsyncClient(timeout=10) as client:
            search_response = await client.get(
                f"{self.base_url}/search",
                params={
                    "part": "snippet",
                    "q": search_query,
                    "type": "video",
                    "maxResults": limit * 2,
                    "videoCategoryId": "10",
                    "regionCode": settings.youtube_region_code,
                    "relevanceLanguage": "en",
                    "key": self.api_key,
                },
            )
            search_response.raise_for_status()
            search_payload = search_response.json()

            video_ids = [item["id"]["videoId"] for item in search_payload.get("items", [])]
            if not video_ids:
                return []

            details_payload = await self._fetch_video_details(client, video_ids)

        return self._serialize_video_items(details_payload.get("items", []), limit=limit, enforce_filter=self._should_filter_query(query))

    async def get_music_recommendations(self, limit: int = 12) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=10) as client:
            collected: list[dict[str, Any]] = []
            seen_ids: set[str] = set()

            for query in self.curated_recommendation_queries:
                search_response = await client.get(
                    f"{self.base_url}/search",
                    params={
                        "part": "snippet",
                        "q": query,
                        "type": "video",
                        "maxResults": 4,
                        "videoCategoryId": "10",
                        "regionCode": settings.youtube_region_code,
                        "relevanceLanguage": "en",
                        "key": self.api_key,
                    },
                )
                search_response.raise_for_status()
                search_payload = search_response.json()

                video_ids = [
                    item["id"]["videoId"]
                    for item in search_payload.get("items", [])
                    if item.get("id", {}).get("videoId") and item["id"]["videoId"] not in seen_ids
                ]
                if not video_ids:
                    continue

                details_payload = await self._fetch_video_details(client, video_ids)
                ranked = self._rank_recommendation_items(details_payload.get("items", []))

                for item in ranked:
                    video_id = item.get("id")
                    if not video_id or video_id in seen_ids:
                        continue
                    collected.append(item)
                    seen_ids.add(video_id)
                    if len(collected) >= limit * 2:
                        break

                if len(collected) >= limit * 2:
                    break

        return self._serialize_video_items(collected, limit=limit, enforce_filter=True)

    async def _fetch_video_details(self, client: httpx.AsyncClient, video_ids: list[str]) -> dict[str, Any]:
        details_response = await client.get(
            f"{self.base_url}/videos",
            params={
                "part": "contentDetails,snippet",
                "id": ",".join(video_ids),
                "key": self.api_key,
            },
        )
        details_response.raise_for_status()
        return details_response.json()

    def _serialize_video_items(self, items: list[dict[str, Any]], limit: int, enforce_filter: bool) -> list[dict[str, Any]]:
        output: list[dict[str, Any]] = []
        for item in items:
            snippet = item.get("snippet", {})
            duration = item.get("contentDetails", {}).get("duration", "PT0S")
            if enforce_filter and not self._is_supported_content(item, snippet, duration):
                continue
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
                    "duration": duration,
                }
            )

            if len(output) >= limit:
                break

        return output

    def _build_search_query(self, query: str) -> str:
        if not self._should_filter_query(query):
            return query

        return f"{query} indian music -bts -kpop -korean"

    def _should_filter_query(self, query: str) -> bool:
        lower = query.lower()
        return not any(keyword in lower for keyword in ("bts", "kpop", "k-pop", "korean", "blackpink"))

    def _is_excluded(self, snippet: dict[str, Any]) -> bool:
        haystack = " ".join(
            [
                str(snippet.get("title", "")),
                str(snippet.get("channelTitle", "")),
                str(snippet.get("description", "")),
            ]
        ).lower()
        blocked_terms = ("bts", "kpop", "k-pop", "korean", "blackpink")
        return any(term in haystack for term in blocked_terms)

    def _is_supported_content(self, item: dict[str, Any], snippet: dict[str, Any], duration: str) -> bool:
        if self._is_excluded(snippet):
            return False

        haystack = " ".join(
            [
                str(snippet.get("title", "")),
                str(snippet.get("channelTitle", "")),
                str(snippet.get("description", "")),
            ]
        ).lower()
        category_id = str(snippet.get("categoryId", ""))
        seconds = self._parse_iso8601_duration(duration)

        # Reject obvious non-audio formats even if they slip through YouTube search.
        blocked_terms = (
            "shorts",
            "reaction",
            "review",
            "trailer",
            "teaser",
            "vlog",
            "prank",
            "meme",
            "status",
            "scene",
            "fight scene",
            "movie clip",
            "gameplay",
            "walkthrough",
            "news",
            "press conference",
            "highlights",
            "recap",
        )
        if any(term in haystack for term in blocked_terms):
            return False

        # Skip very short clips that are usually shorts/snippets, and avoid very long non-podcast uploads.
        if seconds and seconds < 60:
            return False

        music_terms = (
            "song",
            "music",
            "audio",
            "album",
            "playlist",
            "mix",
            "lofi",
            "lo-fi",
            "instrumental",
            "acoustic",
            "cover",
            "dj",
            "remix",
            "session",
            "radio edit",
            "lyric",
            "soundtrack",
            "theme",
            "ep",
        )
        podcast_terms = (
            "podcast",
            "episode",
            "talk",
            "conversation",
            "interview",
            "storytelling",
            "show",
        )

        is_music_category = category_id == "10"
        looks_like_music = any(term in haystack for term in music_terms)
        looks_like_podcast = any(term in haystack for term in podcast_terms) and seconds >= 900

        if looks_like_podcast:
          return True

        if is_music_category or looks_like_music:
            return True

        return False

    def _rank_recommendation_items(self, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        def score(item: dict[str, Any]) -> tuple[int, str]:
            snippet = item.get("snippet", {})
            haystack = " ".join(
                [
                    str(snippet.get("title", "")),
                    str(snippet.get("channelTitle", "")),
                    str(snippet.get("description", "")),
                ]
            ).lower()

            trusted_channels = (
                "vevo",
                "t-series",
                "saregama",
                "sony music india",
                "zee music",
                "yrf",
                "official",
                "topic",
            )
            audio_terms = ("official audio", "audio", "lyric", "lyrics", "song", "music")

            trusted_score = sum(term in haystack for term in trusted_channels)
            audio_score = sum(term in haystack for term in audio_terms)
            return (trusted_score * 10 + audio_score, str(snippet.get("title", "")))

        return sorted(items, key=score, reverse=True)

    def _parse_iso8601_duration(self, value: str) -> int:
        match = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", value)
        if not match:
            return 0

        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        return hours * 3600 + minutes * 60 + seconds
