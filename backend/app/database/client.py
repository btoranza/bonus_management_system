from motor.motor_asyncio import AsyncIOMotorClient

from app.config import MONGODB_URI

client = AsyncIOMotorClient(MONGODB_URI)

db = client["bonus_management"]
