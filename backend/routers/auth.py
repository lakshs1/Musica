from fastapi import APIRouter

from schemas.auth import AuthResponse, LoginRequest, SignUpRequest
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
service = AuthService()


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignUpRequest) -> AuthResponse:
    tokens = service.signup(payload.email, payload.password)
    return AuthResponse(**tokens)


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> AuthResponse:
    tokens = service.login(payload.email, payload.password)
    return AuthResponse(**tokens)
