from pydantic import BaseModel, ConfigDict
from typing import Optional


class SensorBase(BaseModel):
    name: str
    type: Optional[str] = None
    room_id: int


class SensorCreate(SensorBase):
    id: str


class Sensor(SensorBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
