from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import WaterEntry
from app.repositories.base_repository import BaseRepository


class WaterRepository(BaseRepository[WaterEntry]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, WaterEntry)

    async def get_by_date(self, user_id: int, entry_date: date) -> list[WaterEntry]:
        stmt = (
            select(self.model)
            .where(self.model.user_id == user_id, self.model.date == entry_date)
            .order_by(self.model.logged_at)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def delete_by_id(self, entry_id: int, user_id: int) -> WaterEntry | None:
        stmt = select(self.model).where(
            self.model.id == entry_id,
            self.model.user_id == user_id,
        )
        result = await self.session.execute(stmt)
        entry = result.scalar_one_or_none()
        if entry is None:
            return None
        await self.session.delete(entry)
        await self.session.commit()
        return entry
