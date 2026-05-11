from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_access_token
from app.db.database import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_user_service(session: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(session))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, service: UserService = Depends(get_user_service)):
    existing = await service.get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = await service.create_user(data)
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, service: UserService = Depends(get_user_service)):
    user = await service.authenticate(data.email, data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user)
