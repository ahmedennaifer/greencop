from database.session import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)

    customer_id = Column(Integer, ForeignKey("customers.id"))
    customer = relationship("Customer", back_populates="rooms")
    sensors = relationship("Sensor", back_populates="room")

    def __repr__(self):
        return f"<Room {self.name}>"
