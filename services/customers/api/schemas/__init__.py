from .customer import Customer, CustomerCreate, CustomerLogin, CustomerBase
from .server_room import ServerRoomBase
from .sensor import Sensor
from .token import Token, TokenData

Customer.model_rebuild()
CustomerCreate.model_rebuild()
CustomerBase.model_rebuild()
ServerRoomBase.model_rebuild()
Sensor.model_rebuild()

__all__ = [
    "Customer",
    "CustomerCreate",
    "CustomerLogin",
    "CustomerBase",
    "ServerRoomBase",
    "Sensor",
    "Token",
    "TokenData",
]
