from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Habit
from app.repositories.base_repository import BaseRepository


class HabitRepository(BaseRepository[Habit]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Habit)



