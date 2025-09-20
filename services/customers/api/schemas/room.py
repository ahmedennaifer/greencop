from __future__ import annotations


from typing import List, Optional
from pydantic import BaseModel


class Room(BaseModel):
    id: int
    name: str
    customer_id: Optional[int]
    sensors: List[int] = []
