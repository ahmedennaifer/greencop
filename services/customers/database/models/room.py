from database.session import Base
from sqlalchemy import Column, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.mutable import MutableList


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)

    customer_ids = Column(MutableList.as_mutable(JSON), default=[])

    customers = relationship("Customer", back_populates="rooms")
    sensors = relationship("Sensor", back_populates="room")

    def __repr__(self):
        return f"<Room {self.name}>"
