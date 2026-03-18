from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Task
from app.repositories.base_repository import BaseRepository

class TaskRepository(BaseRepository[Task]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Task)

    async def get_by_status(self, user_id: int, is_completed: bool) -> list[Task]:
        stmt = select(self.model).where(self.model.user_id == user_id, self.model.is_completed == is_completed)
        result = await self.session.execute(stmt)

        return list(result.scalars().all())
