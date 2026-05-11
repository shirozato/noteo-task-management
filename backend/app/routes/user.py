from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.database import get_db
from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(session: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(session))


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserRead)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    updated = await service.update_user(current_user.id, data)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated
