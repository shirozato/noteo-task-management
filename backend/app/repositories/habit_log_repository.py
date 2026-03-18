from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepository
from app.models import HabitLog


class HabitLogRepository(BaseRepository[HabitLog]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, HabitLog)

    async def get_log_by_date(self, habit_id: int, log_date: date) -> HabitLog | None:
        stmt = select(self.model).where(self.model.habit_id == habit_id, self.model.completed_date == log_date)
        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def get_logs_by_habit_id(self, habit_id: int) -> list[HabitLog]:
        stmt = select(self.model).where(self.model.habit_id == habit_id)
        result = await self.session.execute(stmt)

        return list(result.scalars().all())