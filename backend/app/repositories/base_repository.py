from uuid import UUID
from typing import Generic, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


T = TypeVar("T")


class BaseRepository(Generic[T]):
    def __init__(self, session: AsyncSession, model: type[T]):
        self.session = session
        self.model = model

    async def create(self, data: dict) -> T:
        instance = self.model(**data)
        self.session.add(instance)

        await self.session.commit()
        await self.session.refresh(instance)

        return instance

    async def update(self, uid: UUID, data: dict) -> T | None:
        instance = await self.get_by_uid(uid)

        if instance is None:
            return None

        else:
            for key, value in data.items():
                setattr(instance, key, value)

            await self.session.commit()
            await self.session.refresh(instance)

        return instance

    async def delete(self, uid: UUID) -> T | None:
        instance = await self.get_by_uid(uid)
        if instance is None:
            return None

        else:
            await self.session.delete(instance)

            await self.session.commit()

        return instance

    async def get_by_uid(self, uid: UUID) ->  T | None:
        stmt = select(self.model).where(self.model.uid == uid)
        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def get_all(self, user_id: int | None = None) -> list[T]:
        stmt = select(self.model)

        if user_id is not None:
            stmt = stmt.where(self.model.user_id == user_id)

        result = await self.session.execute(stmt)

        return list(result.scalars().all())
