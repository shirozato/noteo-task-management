from datetime import date

from app.models import WaterEntry
from app.repositories.water_repository import WaterRepository
from app.schemas.water import WaterEntryCreate


class WaterService:
    def __init__(self, repo: WaterRepository):
        self.repo = repo

    async def log_water(self, data: WaterEntryCreate, user_id: int) -> WaterEntry:
        entry_data = data.model_dump()
        entry_data["user_id"] = user_id
        return await self.repo.create(entry_data)

    async def get_all(self, user_id: int) -> list[WaterEntry]:
        return await self.repo.get_all(user_id)

    async def get_by_date(self, user_id: int, entry_date: date) -> list[WaterEntry]:
        return await self.repo.get_by_date(user_id, entry_date)

    async def delete_entry(self, entry_id: int, user_id: int) -> WaterEntry | None:
        return await self.repo.delete_by_id(entry_id, user_id)
