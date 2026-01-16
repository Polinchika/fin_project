from fastapi import APIRouter, HTTPException
from db import users_collection
from auth import hash_password, verify_password, create_access_token
from models import UserCreate, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(user: UserCreate):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="User already exists")

    doc = {
        "username": user.username,
        "password_hash": hash_password(user.password),
        "role": user.role,
    }
    users_collection.insert_one(doc)

    return {"message": "User registered"}


@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"username": user.username})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(db_user)

    return {"access_token": token, "token_type": "bearer"}
