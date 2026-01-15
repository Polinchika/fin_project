from pydantic import BaseModel
from typing import Literal

Role = Literal["user", "inspector", "admin"]

class UserCreate(BaseModel):
    username: str
    password: str
    role: Role = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class UserPublic(BaseModel):
    username: str
    role: Role
