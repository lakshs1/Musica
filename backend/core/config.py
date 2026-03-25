from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Musica API"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    database_url: str = Field("", alias="DATABASE_URL")
    redis_url: str = Field("", alias="REDIS_URL")

    supabase_url: str = Field("", alias="SUPABASE_URL")
    supabase_anon_key: str = Field("", alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field("", alias="SUPABASE_SERVICE_ROLE_KEY")

    youtube_api_key: str = Field(..., alias="YOUTUBE_API_KEY")
    youtube_base_url: str = "https://www.googleapis.com/youtube/v3"
    youtube_region_code: str = "IN"

    jwt_secret_key: str = Field("", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = "HS256"

    search_cache_ttl_seconds: int = 60 * 60 * 24
    stale_search_ttl_seconds: int = 60 * 60 * 48
    track_cache_ttl_seconds: int = 60 * 60 * 24 * 7
    playback_ttl_seconds: int = 60 * 60 * 2

    rate_limit_requests: int = 120
    rate_limit_window_seconds: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]
