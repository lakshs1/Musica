from fastapi import HTTPException, status

from core.security import get_supabase_client


class AuthService:
    def __init__(self) -> None:
        self.public_client = get_supabase_client(use_service_role=False)

    def signup(self, email: str, password: str) -> dict[str, str | None]:
        response = self.public_client.auth.sign_up({"email": email, "password": password})
        session = response.session
        if session is None or session.access_token is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signup failed")
        return {"access_token": session.access_token, "refresh_token": session.refresh_token}

    def login(self, email: str, password: str) -> dict[str, str | None]:
        response = self.public_client.auth.sign_in_with_password({"email": email, "password": password})
        session = response.session
        if session is None or session.access_token is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return {"access_token": session.access_token, "refresh_token": session.refresh_token}
