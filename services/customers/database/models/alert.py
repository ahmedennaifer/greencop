from customers.database.session import Base
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    sensor_id = Column(String(50), nullable=False)
    alert_type = Column(String(50), nullable=False)
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    acknowledged = Column(Boolean, default=False)
    feedback = Column(String(20), nullable=True)

    def __repr__(self):
        return f"<Alert {self.alert_type} sensor={self.sensor_id} message={self.message}>"


class AlertThreshold(Base):
    __tablename__ = "alert_thresholds"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    max_temperature = Column(Float, default=50.0)
    max_humidity = Column(Float, default=50.0)

    customer = relationship("Customer")

    def __repr__(self):
        return f"<AlertThreshold customer={self.customer_id}>"
