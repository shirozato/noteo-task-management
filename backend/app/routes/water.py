from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.database import get_db
from app.models import User
from app.repositories.water_repository import WaterRepository
from app.schemas.water import WaterEntryCreate, WaterEntryRead
from app.services.water_service import WaterService

router = APIRouter(prefix="/water", tags=["water"])


def get_water_service(session: AsyncSession = Depends(get_db)) -> WaterService:
    return WaterService(WaterRepository(session))


@router.post("/", response_model=WaterEntryRead, status_code=status.HTTP_201_CREATED)
async def log_water(
    data: WaterEntryCreate,
    service: WaterService = Depends(get_water_service),
    current_user: User = Depends(get_current_user),
):
    return await service.log_water(data, user_id=current_user.id)


@router.get("/", response_model=list[WaterEntryRead])
async def get_water(
    service: WaterService = Depends(get_water_service),
    current_user: User = Depends(get_current_user),
):
    return await service.get_all(user_id=current_user.id)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_water_entry(
    entry_id: int,
    service: WaterService = Depends(get_water_service),
    current_user: User = Depends(get_current_user),
):
    deleted = await service.delete_entry(entry_id, user_id=current_user.id)
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
