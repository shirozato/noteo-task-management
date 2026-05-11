from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.database import get_db
from app.models import User
from app.repositories.habit_log_repository import HabitLogRepository
from app.repositories.habit_repository import HabitRepository
from app.schemas.habit import HabitCreate, HabitUpdate, HabitRead
from app.services.habit_service import HabitService

router = APIRouter(prefix="/habits", tags=["habits"])


def get_habit_service(session: AsyncSession = Depends(get_db)) -> HabitService:
    return HabitService(HabitRepository(session), HabitLogRepository(session))


def _to_read(habit, completed_today: bool) -> HabitRead:
    return HabitRead(
        id=habit.id,
        uid=habit.uid,
        title=habit.title,
        icon=habit.icon,
        color=habit.color,
        freq=habit.freq,
        days=habit.days,
        size=habit.size,
        wide=habit.wide,
        target_count=habit.target_count,
        current_streak=habit.current_streak,
        best_streak=habit.best_streak,
        archived_at=habit.archived_at,
        completed_today=completed_today,
    )


@router.post("/", response_model=HabitRead, status_code=status.HTTP_201_CREATED)
async def create_habit(
    data: HabitCreate,
    service: HabitService = Depends(get_habit_service),
    current_user: User = Depends(get_current_user),
):
    habit = await service.create_habit(data, user_id=current_user.id)
    return _to_read(habit, completed_today=False)


@router.get("/", response_model=list[HabitRead])
async def get_all_habits(
    service: HabitService = Depends(get_habit_service),
    current_user: User = Depends(get_current_user),
):
    habits = await service.get_all_habits(user_id=current_user.id)
    result = []
    for habit in habits:
        # Sync streak: detects missed days and resets automatically
        habit = await service.sync_streak(habit)
        completed = await service.is_completed_today(habit.id)
        result.append(_to_read(habit, completed))
    return result


@router.put("/{habit_id}", response_model=HabitRead)
async def update_habit(
    habit_id: UUID,
    data: HabitUpdate,
    service: HabitService = Depends(get_habit_service),
    current_user: User = Depends(get_current_user),
):
    habit = await service.get_habit(habit_id)
    if habit is None or habit.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    updated = await service.update_habit(habit_id, data)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    completed = await service.is_completed_today(updated.id)
    return _to_read(updated, completed)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: UUID,
    service: HabitService = Depends(get_habit_service),
    current_user: User = Depends(get_current_user),
):
    habit = await service.get_habit(habit_id)
    if habit is None or habit.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    await service.delete_habit(habit_id)


@router.post("/{habit_id}/complete", response_model=HabitRead)
async def complete_habit(
    habit_id: UUID,
    service: HabitService = Depends(get_habit_service),
    current_user: User = Depends(get_current_user),
):
    habit = await service.get_habit(habit_id)
    if habit is None or habit.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    updated, _ = await service.complete_habit(habit.id)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return _to_read(updated, completed_today=True)


@router.delete("/{habit_id}/complete", response_model=HabitRead)
async def uncomplete_habit(
    habit_id: UUID,
    service: HabitService = Depends(get_habit_service),
    current_user: User = Depends(get_current_user),
):
    habit = await service.get_habit(habit_id)
    if habit is None or habit.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    updated, _ = await service.uncomplete_habit(habit.id)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return _to_read(updated, completed_today=False)
