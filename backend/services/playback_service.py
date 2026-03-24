import json

from core.config import get_settings
from core.redis_client import redis

settings = get_settings()


class PlaybackService:
    async def get_state(self, playlist_id: int) -> dict:
        key = f"session:{playlist_id}"
        existing = await redis.get(key)
        if existing:
            return json.loads(existing)
        return {"playlist_id": playlist_id, "current_track": None, "timestamp": 0, "is_playing": False}

    async def play(self, playlist_id: int, track_id: int | None, timestamp: float) -> dict:
        state = await self.get_state(playlist_id)
        if track_id is not None:
            state["current_track"] = track_id
        state["timestamp"] = timestamp
        state["is_playing"] = True
        return await self._persist_and_publish(playlist_id, state)

    async def pause(self, playlist_id: int, timestamp: float) -> dict:
        state = await self.get_state(playlist_id)
        state["timestamp"] = timestamp
        state["is_playing"] = False
        return await self._persist_and_publish(playlist_id, state)

    async def seek(self, playlist_id: int, timestamp: float) -> dict:
        state = await self.get_state(playlist_id)
        state["timestamp"] = timestamp
        return await self._persist_and_publish(playlist_id, state)

    async def _persist_and_publish(self, playlist_id: int, state: dict) -> dict:
        key = f"session:{playlist_id}"
        serialized = json.dumps(state)
        await redis.set(key, serialized, ex=settings.playback_ttl_seconds)
        await redis.publish(f"playlist:{playlist_id}:playback", serialized)
        return state
