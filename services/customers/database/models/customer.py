from customers.database.session import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False)

    rooms = relationship("Room", back_populates="customer")

    def __repr__(self):
        return f"<Customer {self.username}>"
