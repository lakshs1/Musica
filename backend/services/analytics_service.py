from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

from core.config import get_settings
from models.user import User

logger = logging.getLogger(__name__)
settings = get_settings()

try:
    import mixpanel
except ImportError:  # pragma: no cover - handled gracefully at runtime
    mixpanel = None


class AnalyticsService:
    def __init__(self) -> None:
        self._client = mixpanel.Mixpanel(settings.mixpanel_project_token) if mixpanel and settings.mixpanel_project_token else None

    @property
    def is_enabled(self) -> bool:
        return self._client is not None

    def track_song_play(
        self,
        user: User,
        *,
        playlist_id: int,
        track_id: int | None,
        timestamp: float,
        properties: Mapping[str, Any] | None = None,
    ) -> None:
        payload: dict[str, Any] = {
            "source": "backend",
            "playlist_id": playlist_id,
            "track_id": track_id,
            "playback_timestamp_seconds": timestamp,
            "user_db_id": user.id,
            "supabase_user_id": user.supabase_user_id,
            "email": user.email,
        }
        if properties:
            payload.update(dict(properties))

        self.track(
            user.supabase_user_id,
            "song_played",
            payload,
        )

    def track(self, distinct_id: str, event: str, properties: Mapping[str, Any]) -> None:
        if not self._client:
            if settings.mixpanel_debug:
                logger.debug("Mixpanel disabled; skipped event %s with properties=%s", event, dict(properties))
            return

        payload = {"distinct_id": distinct_id, **{key: value for key, value in dict(properties).items() if value is not None}}
        try:
            self._client.track(distinct_id, event, payload)
            if settings.mixpanel_debug:
                logger.debug("Mixpanel event sent: %s %s", event, payload)
        except Exception:  # pragma: no cover - network failures should not break playback
            logger.exception("Failed to send Mixpanel event %s", event)


analytics = AnalyticsService()
