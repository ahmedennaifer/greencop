from pydantic import BaseModel
from datetime import datetime
from typing import Literal


class AlertBase(BaseModel):
    sensor_id: int
    alert_type: Literal["temperature", "humidity"]
    value: float
    threshold: float


class AlertCreate(AlertBase):
    pass


class Alert(AlertBase):
    id: int
    timestamp: datetime
    acknowledged: bool

    class Config:
        from_attributes = True


class AlertThreshold(BaseModel):
    id: int
    customer_id: int
    max_temperature: float
    max_humidity: float

    class Config:
        from_attributes = True


class AlertThresholdUpdate(BaseModel):
    max_temperature: float
    max_humidity: float
