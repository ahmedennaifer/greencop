from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database.session import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    type = Column(String(50))

    room_id = Column(Integer, ForeignKey("rooms.id"))
    room = relationship("Room", back_populates="sensors")

    def __repr__(self):
        return f"<Sensor {self.name}>"
