import uuid
from pydantic import BaseModel, Field, ConfigDict, EmailStr


class UserBase(BaseModel):
    name: str = Field(max_length=50)
    email: EmailStr = Field(max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=1, max_length=72)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=50)
    avatar: str | None = Field(default=None, max_length=10)
    avatar_color: str | None = Field(default=None, max_length=20)
    water_goal: int | None = Field(default=None, ge=100, le=10000)
    water_unit: str | None = Field(default=None, max_length=10)


class UserRead(UserBase):
    uid: uuid.UUID
    avatar: str | None = None
    avatar_color: str | None = None
    water_goal: int = 2000
    water_unit: str = "ml"

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
