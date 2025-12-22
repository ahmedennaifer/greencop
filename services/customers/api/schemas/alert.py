from pydantic import BaseModel, validator
from datetime import datetime
from typing import Literal, Optional


class AlertBase(BaseModel):
    sensor_id: str
    alert_type: Literal["temperature", "humidity"]
    message: str


class AlertCreate(AlertBase):
    pass


class Alert(AlertBase):
    id: int
    timestamp: datetime
    acknowledged: bool
    feedback: Optional[str] = None

    class Config:
        from_attributes = True


class FeedbackSchema(BaseModel):
    feedback_type: str

    @validator('feedback_type')
    def validate_feedback_type(cls, v):
        if v not in ['false_positive', 'true_positive']:
            raise ValueError('Must be false_positive or true_positive')
        return v


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
