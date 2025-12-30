from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from customers.database.session import Base


class ModelTrainingRun(Base):
    __tablename__ = "model_training_runs"

    id = Column(Integer, primary_key=True, index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False)
    model_type = Column(String, nullable=False)
    training_data_count = Column(Integer, nullable=True)
    validated_data_count = Column(Integer, nullable=True)
    metrics = Column(JSON, nullable=True)
    model_version = Column(String, nullable=True)
    triggered_by = Column(String, nullable=False)
    error_message = Column(String, nullable=True)
