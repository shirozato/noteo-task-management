from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.database import get_db
from app.models import User
from app.repositories.sleep_repository import SleepRepository
from app.schemas.sleep import SleepRead, SleepCreate, SleepUpdate
from app.services.sleep_service import SleepService

router = APIRouter(prefix="/sleep", tags=["sleep"])


def get_sleep_service(session: AsyncSession = Depends(get_db)) -> SleepService:
    return SleepService(SleepRepository(session))


@router.post("/", response_model=SleepRead, status_code=status.HTTP_201_CREATED)
async def add_sleep(
    data: SleepCreate,
    service: SleepService = Depends(get_sleep_service),
    current_user: User = Depends(get_current_user),
):
    return await service.add_sleep_info(data, user_id=current_user.id)


@router.get("/", response_model=list[SleepRead])
async def get_all_sleep(
    service: SleepService = Depends(get_sleep_service),
    current_user: User = Depends(get_current_user),
):
    return await service.list_sleep_info(user_id=current_user.id) or []


@router.put("/{sleep_id}", response_model=SleepRead)
async def update_sleep(
    sleep_id: UUID,
    data: SleepUpdate,
    service: SleepService = Depends(get_sleep_service),
    current_user: User = Depends(get_current_user),
):
    sleep = await service.get_sleep_info(sleep_id)
    if sleep is None or sleep.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sleep record not found")

    updated = await service.update_sleep_info(data, sleep_id)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sleep record not found")
    return updated


@router.delete("/{sleep_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sleep(
    sleep_id: UUID,
    service: SleepService = Depends(get_sleep_service),
    current_user: User = Depends(get_current_user),
):
    sleep = await service.get_sleep_info(sleep_id)
    if sleep is None or sleep.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sleep record not found")
    await service.delete_sleep_info(sleep_id)
