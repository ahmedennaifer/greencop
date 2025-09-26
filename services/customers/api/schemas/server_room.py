from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ServerRoomBase(BaseModel):
    name: str
    customer_id: int


class ServerRoomCreate(ServerRoomBase):
    pass


class ServerRoom(ServerRoomBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
