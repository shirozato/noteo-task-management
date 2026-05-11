import uuid
from datetime import datetime

from sqlalchemy import UUID, String, ForeignKey, Integer, CheckConstraint, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    uid: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        default=uuid.uuid4,
        index=True
    )

    title: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str] = mapped_column(String(10), nullable=False)

    color: Mapped[str] = mapped_column(String(20), default="default", nullable=False)
    freq: Mapped[str] = mapped_column(String(20), default="daily", nullable=False)
    days: Mapped[str] = mapped_column(String(7), default="1111111", nullable=False)
    size: Mapped[str] = mapped_column(String(1), default="m", nullable=False)
    wide: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    target_count: Mapped[int] = mapped_column(Integer, default=7)
    period_days: Mapped[int] = mapped_column(Integer, default=7)

    current_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    best_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship(back_populates="habits")

    logs: Mapped[list["HabitLog"]] = relationship(back_populates="habit", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("target_count > 0", name="target_count_positive"),
    )
