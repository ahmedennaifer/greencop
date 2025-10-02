from customers.database.session import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    type = Column(String(50))

    room_id = Column(Integer, ForeignKey("rooms.id"))
    room = relationship("ServerRoom", back_populates="sensors")
    readings = relationship("Reading", back_populates="sensor")

    def __repr__(self):
        return f"<Sensor {self.name}>"
