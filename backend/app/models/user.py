import uuid

from sqlalchemy import UUID, String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    uid: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        default=uuid.uuid4,
        index=True
    )

    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    avatar: Mapped[str | None] = mapped_column(String(10), nullable=True, default=None)
    avatar_color: Mapped[str | None] = mapped_column(String(20), nullable=True, default=None)
    water_goal: Mapped[int] = mapped_column(Integer, default=2000)
    water_unit: Mapped[str] = mapped_column(String(10), default="ml")

    tasks: Mapped[list["Task"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    habits: Mapped[list["Habit"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sleeps: Mapped[list["Sleep"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    water_entries: Mapped[list["WaterEntry"]] = relationship(back_populates="user", cascade="all, delete-orphan")
