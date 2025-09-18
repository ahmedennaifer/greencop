from pydantic import BaseModel, EmailStr, field_validator


class CustomerBase(BaseModel):
    email: EmailStr
    username: str

    @field_validator("username")
    def validate_username(cls, usr: str) -> str:
        if len(usr) < 6 or len(usr) > 12:
            raise ValueError(
                f"Username must be between 6 and 12 caracters!. Got: {len(usr)}"
            )
        return usr


class CustomerCreate(CustomerBase):
    password: str

    @field_validator("password")
    def validate_password(cls, pwd: str) -> str:
        if pwd.isdigit() or pwd.isalpha() or len(pwd) < 8:
            raise ValueError(
                "Password must be a mix of nums and letters, and have more than 8 caracters."
            )
        return pwd


class Customer(CustomerBase):
    id: int

    class Config:
        orm_mode = True


class CustomerLogin(BaseModel):
    email: EmailStr
    password: str
