import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field, ConfigDict


class WaterEntryCreate(BaseModel):
    date: date
    amount: int = Field(gt=0, le=5000)


class WaterEntryRead(BaseModel):
    id: int
    uid: uuid.UUID
    date: date
    amount: int
    logged_at: datetime

    model_config = ConfigDict(from_attributes=True)
