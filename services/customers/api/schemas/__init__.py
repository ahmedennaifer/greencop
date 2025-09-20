from .customer import Customer, CustomerCreate, CustomerLogin, CustomerBase
from .room import Room
from .sensor import Sensor
from .token import Token, TokenData

Customer.model_rebuild()
CustomerCreate.model_rebuild()
CustomerBase.model_rebuild()
Room.model_rebuild()
Sensor.model_rebuild()

# Export everything
__all__ = [
    "Customer",
    "CustomerCreate",
    "CustomerLogin",
    "CustomerBase",
    "Room",
    "Sensor",
    "Token",
    "TokenData",
]
