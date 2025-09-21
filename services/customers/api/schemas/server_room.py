from __future__ import annotations


from typing import List, Optional
from pydantic import BaseModel


class ServerRoomBase(BaseModel):
    name: str
    customer_id: int
    sensors: Optional[List[int]] = []
