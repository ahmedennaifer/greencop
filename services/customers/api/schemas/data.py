from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SensorData(BaseModel):
    node_id: str
    message_id: str
    timestamp: datetime
    temperature: float
    humidity: float


class SensorStats(BaseModel):
    avg_temperature: float
    avg_humidity: float
    min_temperature: float
    max_temperature: float
    min_humidity: float
    max_humidity: float
