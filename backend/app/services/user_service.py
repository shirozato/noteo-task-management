from uuid import UUID

from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def create_user(self, data: UserCreate) -> User | None:
        user_data = data.model_dump()
        password = user_data.pop("password")
        user_data["hashed_password"] = f"hashed_{password}"  # заглушка
        return await self.repo.create(user_data)

    async def get_user_by_uid(self, uid: UUID) -> User | None:
        return await self.repo.get_by_uid(uid)

    async def get_user_by_email(self, email: str) -> User | None:
        return await self.repo.get_by_email(email)