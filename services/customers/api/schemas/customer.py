from pydantic import BaseModel


class CustomerBase(BaseModel):
    email: str
    username: str


class CustomerCreate(CustomerBase):
    password: str


class Customer(CustomerBase):
    id: int

    class Config:
        orm_mode = True


class CustomerLogin(BaseModel):
    email: str
    password: str
