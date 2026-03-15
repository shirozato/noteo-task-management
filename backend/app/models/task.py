import uuid
from datetime import datetime

from sqlalchemy import UUID, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    uid: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        default=uuid.uuid4,
        index=True
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(10))

    is_completed: Mapped[bool] = mapped_column(default=False)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    priority: Mapped[int] = mapped_column(default=1)

    actual_time_spent: Mapped[int] = mapped_column(default=0)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship(back_populates="tasks")