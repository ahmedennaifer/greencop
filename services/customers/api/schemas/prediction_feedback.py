from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PredictionFeedbackCreate(BaseModel):
    sensor_id: str
    timestamp: datetime
    predicted_temp: float
    predicted_humidity: float
    actual_temp: float
    actual_humidity: float
    anomaly_predicted: bool
    feedback: Optional[str] = None


class PredictionFeedbackUpdate(BaseModel):
    feedback: Optional[str] = None
    actual_temp: Optional[float] = None
    actual_humidity: Optional[float] = None


class PredictionFeedback(BaseModel):
    id: int
    sensor_id: str
    timestamp: datetime
    predicted_temp: float
    predicted_humidity: float
    actual_temp: float
    actual_humidity: float
    anomaly_predicted: bool
    feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
