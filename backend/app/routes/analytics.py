from datetime import datetime, timedelta, timezone, date
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.database import get_db
from app.models import User
from app.repositories.habit_log_repository import HabitLogRepository
from app.repositories.habit_repository import HabitRepository
from app.repositories.sleep_repository import SleepRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.water_repository import WaterRepository
from pydantic import BaseModel

router = APIRouter(prefix="/analytics", tags=["analytics"])


class DailyStats(BaseModel):
    date: str
    tasks_done: int
    tasks_total: int
    habits_done: int
    habits_total: int
    water_ml: int
    sleep_hours: float | None


class AnalyticsResponse(BaseModel):
    period: str
    score: int
    tasks_completion: float
    habits_completion: float
    avg_water_ml: float
    avg_sleep_hours: float | None
    daily: list[DailyStats]


@router.get("/", response_model=AnalyticsResponse)
async def get_analytics(
    period: Literal["week", "month"] = Query(default="week"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    days = 7 if period == "week" else 30
    now = datetime.now(timezone.utc)
    start_dt = now - timedelta(days=days)
    start_date = start_dt.date()

    task_repo = TaskRepository(session)
    habit_repo = HabitRepository(session)
    log_repo = HabitLogRepository(session)
    sleep_repo = SleepRepository(session)
    water_repo = WaterRepository(session)

    all_tasks = await task_repo.get_all(current_user.id)
    all_habits = await habit_repo.get_all(current_user.id)
    all_sleep = await sleep_repo.get_by_period(current_user.id, start_dt, now)
    all_water = await water_repo.get_all(current_user.id)

    period_tasks = [t for t in all_tasks if t.created_at.date() >= start_date]
    period_water = [w for w in all_water if w.date >= start_date]

    # Build per-day stats
    daily: list[DailyStats] = []
    for i in range(days):
        day = (now - timedelta(days=days - 1 - i)).date()
        day_str = day.isoformat()

        tasks_day = [t for t in period_tasks if t.created_at.date() == day]
        tasks_done = sum(1 for t in tasks_day if t.is_completed)

        water_ml = sum(w.amount for w in period_water if w.date == day)

        sleep_hrs = None
        day_sleeps = [s for s in all_sleep if s.bed_time.date() == day and s.rise_time]
        if day_sleeps:
            s = day_sleeps[-1]
            delta = s.rise_time - s.bed_time
            if delta.total_seconds() < 0:
                delta = timedelta(hours=24) + delta
            sleep_hrs = round(delta.total_seconds() / 3600, 1)

        # habit completions for this day
        habits_done = 0
        for habit in all_habits:
            log = await log_repo.get_log_by_date(habit.id, day)
            if log:
                habits_done += 1

        daily.append(DailyStats(
            date=day_str,
            tasks_done=tasks_done,
            tasks_total=len(tasks_day),
            habits_done=habits_done,
            habits_total=len(all_habits),
            water_ml=water_ml,
            sleep_hours=sleep_hrs,
        ))

    # Aggregate
    total_tasks = sum(d.tasks_total for d in daily)
    done_tasks = sum(d.tasks_done for d in daily)
    tasks_pct = round(done_tasks / total_tasks * 100, 1) if total_tasks else 0

    total_habit_slots = sum(d.habits_total for d in daily)
    done_habit_slots = sum(d.habits_done for d in daily)
    habits_pct = round(done_habit_slots / total_habit_slots * 100, 1) if total_habit_slots else 0

    avg_water = round(sum(d.water_ml for d in daily) / days, 0)
    sleep_vals = [d.sleep_hours for d in daily if d.sleep_hours is not None]
    avg_sleep = round(sum(sleep_vals) / len(sleep_vals), 1) if sleep_vals else None

    water_goal = current_user.water_goal or 2000
    water_score = min(100, round(avg_water / water_goal * 100))
    sleep_score = 0
    if avg_sleep:
        if avg_sleep >= 7:
            sleep_score = 100
        elif avg_sleep >= 6:
            sleep_score = 70
        else:
            sleep_score = 40

    score = round((tasks_pct + habits_pct + water_score + sleep_score) / 4)

    return AnalyticsResponse(
        period=period,
        score=score,
        tasks_completion=tasks_pct,
        habits_completion=habits_pct,
        avg_water_ml=avg_water,
        avg_sleep_hours=avg_sleep,
        daily=daily,
    )
