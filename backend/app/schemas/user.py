import uuid

from pydantic import BaseModel, Field, ConfigDict, EmailStr


class UserBase(BaseModel):
    name: str = Field(max_length=50)
    email: EmailStr = Field(max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=255)


class UserRead(UserBase):
    uid: uuid.UUID

    model_config = ConfigDict(from_attributes=True)