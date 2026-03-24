from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import Client, create_client

from core.config import get_settings
from core.db import get_db
from models.user import User

settings = get_settings()
security_scheme = HTTPBearer(auto_error=True)


def get_supabase_client(use_service_role: bool = False) -> Client:
    key = settings.supabase_service_role_key if use_service_role else settings.supabase_anon_key
    return create_client(settings.supabase_url, key)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    supabase_client = get_supabase_client()
    response = supabase_client.auth.get_user(token)
    user_data: dict[str, Any] | None = response.user.model_dump() if response and response.user else None
    if not user_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token")

    supabase_user_id = user_data["id"]
    stmt = select(User).where(User.supabase_user_id == supabase_user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if user is None:
        user = User(email=user_data.get("email", ""), supabase_user_id=supabase_user_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
