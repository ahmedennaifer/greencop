from customers.database.session import Base
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True)
    reading = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False)

    sensor_id = Column(Integer, ForeignKey("sensors.id"))
    sensor = relationship("Sensor", back_populates="readings")

    def __repr__(self):
        return f"<Reading {self.reading} at {self.timestamp}>"