from customers.database.session import Base
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    alert_type = Column(String(20), nullable=False)  # 'temperature' or 'humidity'
    value = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    acknowledged = Column(Boolean, default=False)

    sensor = relationship("Sensor")

    def __repr__(self):
        return f"<Alert {self.alert_type} sensor={self.sensor_id} value={self.value}>"


class AlertThreshold(Base):
    __tablename__ = "alert_thresholds"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    max_temperature = Column(Float, default=50.0)
    max_humidity = Column(Float, default=50.0)

    customer = relationship("Customer")

    def __repr__(self):
        return f"<AlertThreshold customer={self.customer_id}>"
