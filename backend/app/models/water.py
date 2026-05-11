import uuid
from datetime import datetime, date, timezone

from sqlalchemy import UUID, ForeignKey, DateTime, Date, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class WaterEntry(Base):
    __tablename__ = "water_entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    uid: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        default=uuid.uuid4,
        index=True
    )

    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship(back_populates="water_entries")
