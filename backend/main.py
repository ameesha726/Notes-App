from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import uuid4
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
import os


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/notesdb")
SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


app = FastAPI(title="Notes App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()


class UserCreate(BaseModel):
    user_name: str
    user_email: EmailStr
    password: str

class UserInDB(BaseModel):
    user_id: str
    user_name: str
    user_email: EmailStr
    hashed_password: str
    last_update: datetime
    created_on: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class NoteCreate(BaseModel):
    note_title: str = Field(..., max_length=200)
    note_content: str

class NoteInDB(BaseModel):
    note_id: str
    note_title: str
    note_content: str
    last_update: datetime
    created_on: datetime
    owner_id: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user_by_email(email: str):
    return await db.users.find_one({"user_email": email})

async def get_user_by_id(user_id: str):
    return await db.users.find_one({"user_id": user_id})

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


@app.post("/auth/register", response_model=dict)
async def register(user: UserCreate):
    existing = await get_user_by_email(user.user_email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    uid = str(uuid4())
    now = datetime.utcnow()
    hashed = get_password_hash(user.password)

    doc = {
        "user_id": uid,
        "user_name": user.user_name,
        "user_email": user.user_email,
        "hashed_password": hashed,
        "last_update": now,
        "created_on": now
    }

    await db.users.insert_one(doc)
    return {"msg": "registered"}

@app.post("/auth/login", response_model=Token)
async def login(form: dict):
    email = form.get("user_email")
    password = form.get("password")

    user = await authenticate_user(email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["user_id"]})
    return {"access_token": token, "token_type": "bearer"}


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user


@app.post("/notes", response_model=dict)
async def create_note(note: NoteCreate, current_user=Depends(get_current_user)):
    nid = str(uuid4())
    now = datetime.utcnow()

    doc = {
        "note_id": nid,
        "note_title": note.note_title,
        "note_content": note.note_content,
        "last_update": now,
        "created_on": now,
        "owner_id": current_user["user_id"]
    }

    await db.notes.insert_one(doc)
    return {"note_id": nid}

@app.get("/notes", response_model=List[NoteInDB])
async def list_notes(current_user=Depends(get_current_user)):
    cursor = db.notes.find({"owner_id": current_user["user_id"]}).sort("last_update", -1)
    res = []
    async for n in cursor:
        res.append(NoteInDB(**{
            "note_id": n["note_id"],
            "note_title": n["note_title"],
            "note_content": n["note_content"],
            "last_update": n["last_update"],
            "created_on": n["created_on"],
            "owner_id": n["owner_id"]
        }))
    return res

@app.get("/notes/{note_id}", response_model=NoteInDB)
async def get_note(note_id: str, current_user=Depends(get_current_user)):
    n = await db.notes.find_one({"note_id": note_id, "owner_id": current_user["user_id"]})
    if not n:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteInDB(**{
        "note_id": n["note_id"],
        "note_title": n["note_title"],
        "note_content": n["note_content"],
        "last_update": n["last_update"],
        "created_on": n["created_on"],
        "owner_id": n["owner_id"]
    })

@app.put("/notes/{note_id}", response_model=dict)
async def update_note(note_id: str, note: NoteCreate, current_user=Depends(get_current_user)):
    now = datetime.utcnow()
    result = await db.notes.update_one(
        {"note_id": note_id, "owner_id": current_user["user_id"]},
        {"$set": {"note_title": note.note_title, "note_content": note.note_content, "last_update": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"msg": "updated"}

@app.delete("/notes/{note_id}", response_model=dict)
async def delete_note(note_id: str, current_user=Depends(get_current_user)):
    result = await db.notes.delete_one({"note_id": note_id, "owner_id": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"msg": "deleted"}
