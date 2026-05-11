import uuid
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class HabitBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    icon: str = Field(max_length=10)
    color: str = Field(default="default", max_length=20)
    freq: str = Field(default="daily", max_length=20)
    days: str = Field(default="1111111", max_length=7)
    size: str = Field(default="m", max_length=1)
    wide: bool = False
    target_count: int = Field(default=7, gt=0, le=7)


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    icon: str | None = Field(default=None, max_length=10)
    color: str | None = Field(default=None, max_length=20)
    freq: str | None = Field(default=None, max_length=20)
    days: str | None = Field(default=None, max_length=7)
    size: str | None = Field(default=None, max_length=1)
    wide: bool | None = None
    target_count: int | None = Field(default=None, gt=0, le=7)
    archived_at: datetime | None = None


class HabitRead(HabitBase):
    id: int
    uid: uuid.UUID
    current_streak: int
    best_streak: int
    completed_today: bool = False
    archived_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
