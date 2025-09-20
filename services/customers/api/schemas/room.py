from __future__ import annotations


from typing import TYPE_CHECKING, List
from pydantic import BaseModel


if TYPE_CHECKING:
    from .customer import Customer
    from .sensor import Sensor


class Room(BaseModel):
    id: int
    name: str
    customers: List["Customer"]
    sensors: List["Sensor"]
