from fastapi import HTTPException, Request, status

from core.config import get_settings
from core.redis_client import redis

settings = get_settings()


async def enforce_rate_limit(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    bucket = f"rate:{client_ip}"

    current = await redis.incr(bucket)
    if current == 1:
        await redis.expire(bucket, settings.rate_limit_window_seconds)

    if current > settings.rate_limit_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please retry later.",
        )
