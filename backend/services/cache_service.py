import asyncio
import json
from collections.abc import Awaitable, Callable
from typing import Any

from core.redis_client import redis


class CacheService:
    async def get_json(self, key: str) -> dict[str, Any] | None:
        raw = await redis.get(key)
        if not raw:
            return None
        return json.loads(raw)

    async def set_json(self, key: str, value: dict[str, Any], ttl_seconds: int) -> None:
        await redis.set(key, json.dumps(value), ex=ttl_seconds)

    async def get_or_swr(
        self,
        key: str,
        stale_key: str,
        refresh_coro: Callable[[], Awaitable[dict[str, Any]]],
        ttl_seconds: int,
        stale_ttl_seconds: int,
    ) -> tuple[dict[str, Any], str]:
        fresh = await self.get_json(key)
        if fresh is not None:
            return fresh, "cache"

        stale = await self.get_json(stale_key)
        if stale is not None:
            asyncio.create_task(self._refresh(key, stale_key, refresh_coro, ttl_seconds, stale_ttl_seconds))
            return stale, "stale-cache"

        data = await refresh_coro()
        await self.set_json(key, data, ttl_seconds)
        await self.set_json(stale_key, data, stale_ttl_seconds)
        return data, "origin"

    async def _refresh(
        self,
        key: str,
        stale_key: str,
        refresh_coro: Callable[[], Awaitable[dict[str, Any]]],
        ttl_seconds: int,
        stale_ttl_seconds: int,
    ) -> None:
        data = await refresh_coro()
        await self.set_json(key, data, ttl_seconds)
        await self.set_json(stale_key, data, stale_ttl_seconds)
