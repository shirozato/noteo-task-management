from datetime import date

from pydantic import BaseModel, ConfigDict



class HabitLogCreate(BaseModel):
    pass


class HabitLogRead(BaseModel):
    id: int
    habit_id: int
    completed_date: date

    model_config = ConfigDict(from_attributes=True)