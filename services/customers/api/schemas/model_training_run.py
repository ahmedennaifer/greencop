from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict


class ModelTrainingRunResponse(BaseModel):
    id: int
    started_at: datetime
    completed_at: Optional[datetime]
    status: str
    model_type: str
    training_data_count: Optional[int]
    validated_data_count: Optional[int]
    metrics: Optional[Dict]
    model_version: Optional[str]
    triggered_by: str
    error_message: Optional[str]

    class Config:
        from_attributes = True
