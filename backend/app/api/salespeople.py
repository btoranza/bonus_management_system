from fastapi import APIRouter

from app.database.client import db
from app.schemas.salesperson import Salesperson

router = APIRouter(prefix="/salespeople", tags=["salespeople"])


@router.get("/", response_model=list[Salesperson])
async def list_salespeople():
    salespeople = await db.salespeople.find().to_list(length=100)
    return salespeople
