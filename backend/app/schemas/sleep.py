import uuid
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class SleepBase(BaseModel):
    bed_time: datetime
    rise_time: datetime | None = Field(default=None)


class SleepCreate(SleepBase):
    pass


class SleepUpdate(BaseModel):
    bed_time: datetime | None = Field(default=None)
    rise_time: datetime | None = Field(default=None)


class SleepRead(SleepBase):
    uid: uuid.UUID

    model_config = ConfigDict(from_attributes=True)