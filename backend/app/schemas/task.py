import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class PriorityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=500)
    deadline: datetime | None = Field(default=None)
    priority: PriorityLevel | None = None
    tags: list[str] = Field(default_factory=list)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=500)
    is_completed: bool | None = None
    deadline: datetime | None = Field(default=None)
    priority: PriorityLevel | None = None
    tags: list[str] | None = None
    archived_at: datetime | None = None
    done_at: datetime | None = None


class TaskRead(TaskBase):
    id: int
    uid: uuid.UUID
    is_completed: bool
    created_at: datetime
    archived_at: datetime | None = None
    done_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
