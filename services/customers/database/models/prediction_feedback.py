from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from customers.database.session import Base


class PredictionFeedback(Base):
    __tablename__ = "prediction_feedback"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    predicted_temp = Column(Float, nullable=False)
    predicted_humidity = Column(Float, nullable=False)
    actual_temp = Column(Float, nullable=False)
    actual_humidity = Column(Float, nullable=False)
    anomaly_predicted = Column(Boolean, default=False)
    feedback = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
