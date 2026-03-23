from uuid import UUID
from datetime import date

from app.repositories.habit_log_repository import HabitLogRepository
from app.repositories.habit_repository import HabitRepository
from app.schemas.habit import HabitCreate, HabitUpdate
from app.models import Habit

class HabitService:
    def __init__(self, habit_repo: HabitRepository, log_repo: HabitLogRepository):
        self.habit_repo = habit_repo
        self.log_repo = log_repo

    async def create_habit(self, data: HabitCreate, user_id: int) -> Habit | None:
        habit_data = data.model_dump()
        habit_data['user_id'] = user_id
        return await self.habit_repo.create(habit_data)

    async def get_habit(self, uid: UUID) -> Habit | None:
        return await self.habit_repo.get_by_uid(uid)

    async def update_habit(self, uid: UUID, data: HabitUpdate) -> Habit | None:
        habit_data = data.model_dump(exclude_unset=True)
        return await self.habit_repo.update(uid, habit_data)

    async def delete_habit(self, uid: UUID) -> Habit | None:
        return await self.habit_repo.delete(uid)

    async def get_all_habits(self, user_id: int) -> list[Habit] | None:
        return await self.habit_repo.get_all(user_id)

    async def complete_habit(self, uid: UUID) -> Habit | None:
        habit = await self.get_habit(uid)

        if habit:
            habit_log = await self.log_repo.get_log_by_date(habit.id, date.today())
            if habit_log is not None:
                return habit

            else:
                await self.log_repo.create(
                    {"habit_id": habit.id, "completed_date": date.today()}
                )
                return habit

        else:
            return None

