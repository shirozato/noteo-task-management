import uuid

from pydantic import BaseModel, Field, ConfigDict

from app.schemas.habit_history import HabitLogRead


class HabitBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)

    icon: str = Field(max_length=10)
    target_count: int = Field(gt=0, le=7)


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    title: str | None = Field(default = None, min_length=1, max_length=50)
    icon: str | None = Field(default = None, max_length=10)
    target_count: int | None = Field(default = None, gt=0, le=7)


class HabitRead(HabitBase):
    uid : uuid.UUID
    current_streak: int
    best_streak: int

    logs: list[HabitLogRead] = []

    model_config = ConfigDict(from_attributes=True)