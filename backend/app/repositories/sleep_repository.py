from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Sleep
from app.repositories.base_repository import BaseRepository


class SleepRepository(BaseRepository[Sleep]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Sleep)

    async def get_by_period(self, user_id: int, start_date: datetime, end_date: datetime) -> list[Sleep]:
        stmt = select(self.model).where(self.model.user_id == user_id, self.model.bed_time >= start_date, self.model.bed_time <= end_date)
        result = await self.session.execute(stmt)

        return list(result.scalars().all())