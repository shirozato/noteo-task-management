from uuid import UUID

import bcrypt
from sqlalchemy import select

from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def create_user(self, data: UserCreate) -> User:
        user_data = data.model_dump()
        password = user_data.pop("password")
        user_data["email"] = user_data["email"].lower().strip()
        user_data["hashed_password"] = _hash_password(password)
        return await self.repo.create(user_data)

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self.repo.get_by_email(email.lower().strip())
        if user is None:
            return None
        if not _verify_password(password, user.hashed_password):
            return None
        return user

    async def get_user_by_uid(self, uid: UUID) -> User | None:
        return await self.repo.get_by_uid(uid)

    async def get_user_by_email(self, email: str) -> User | None:
        return await self.repo.get_by_email(email)

    async def get_user_by_id(self, user_id: int) -> User | None:
        return await self.repo.get_by_id(user_id)

    async def update_user(self, user_id: int, data: UserUpdate) -> User | None:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.repo.get_by_id(user_id)

        result = await self.repo.session.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if user is None:
            return None

        for key, value in update_data.items():
            setattr(user, key, value)

        await self.repo.session.commit()
        await self.repo.session.refresh(user)
        return user
