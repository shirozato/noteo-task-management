import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class PriorityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=50)
    description: str | None = Field(default = None, min_length=1, max_length=100)

    deadline: datetime | None = Field(default = None)
    priority: PriorityLevel | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default = None, min_length=1, max_length=50)
    description: str | None = Field(default=None, min_length=1, max_length=100)
    is_completed: bool | None = None
    deadline: datetime | None = Field(default=None)
    priority: PriorityLevel | None = None


class TaskRead(TaskBase):
    uid: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)