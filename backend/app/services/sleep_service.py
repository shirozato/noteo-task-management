from uuid import UUID
from datetime import datetime

from app.models import Sleep
from app.repositories.sleep_repository import SleepRepository
from app.schemas.sleep import SleepCreate, SleepUpdate


class SleepService:
    def __init__(self, repo: SleepRepository):
        self.repo = repo

    async def add_sleep_info(self, data: SleepCreate, user_id: int) -> Sleep:
        sleep_data = data.model_dump()
        sleep_data["user_id"] = user_id
        return await self.repo.create(sleep_data)

    async def update_sleep_info(self, data: SleepUpdate, uid: UUID) -> Sleep | None:
        sleep_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(uid, sleep_data)

    async def delete_sleep_info(self, uid: UUID) -> Sleep | None:
        return await self.repo.delete(uid)

    async def list_sleep_info(self, user_id: int) -> list[Sleep] | None:
        return await self.repo.get_all(user_id)

    async def get_sleep_info(self, uid: UUID) -> Sleep | None:
        return await self.repo.get_by_uid(uid)

    async def get_sleep_by_period(self, user_id: int, start_date: datetime, end_date: datetime) -> list[Sleep] | None:
        return await self.repo.get_by_period(user_id, start_date, end_date)