from datetime import date

from sqlalchemy import ForeignKey, Date, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    completed_date: Mapped[date] = mapped_column(Date, index=True)

    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id"))
    habit: Mapped["Habit"] = relationship(back_populates="logs")

    __table_args__ = (
        UniqueConstraint("habit_id", "completed_date", name="unique_habit_log"),
    )
