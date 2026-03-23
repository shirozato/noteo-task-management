from uuid import UUID

from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate
from app.models import Task


class TaskService:
    def __init__(self, repo: TaskRepository):
        self.repo = repo

    async def create_task(self, data: TaskCreate, user_id: int) -> Task:
        task_data = data.model_dump()
        task_data['user_id'] = user_id
        return await self.repo.create(task_data)

    async def update_task(self, data: TaskUpdate, uid: UUID) -> Task | None:
        task_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(uid, task_data)

    async def get_task(self, uid: UUID) -> Task | None:
        return await self.repo.get_by_uid(uid)

    async def get_tasks(self, user_id: int) -> list[Task] | None:
        return await self.repo.get_all(user_id)

    async def delete_task(self, uid: UUID) -> Task | None:
        return await self.repo.delete(uid)

    async def get_task_by_status(self, user_id: int, is_completed: bool) -> list[Task] | None:
        return await self.repo.get_by_status(user_id, is_completed)