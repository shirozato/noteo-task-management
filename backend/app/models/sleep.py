import uuid
from datetime import datetime

from sqlalchemy import UUID, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

class Sleep(Base):
    __tablename__ = "sleeps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    uid: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        default=uuid.uuid4,
        index=True
    )

    bed_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    rise_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship(back_populates="sleeps")