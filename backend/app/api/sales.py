from datetime import datetime, timezone

from bson.decimal128 import Decimal128
from fastapi import APIRouter

from app.database.client import db
from app.schemas.sale import Sale, SaleResponse

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/", response_model=list[SaleResponse])
async def list_sales():
    sales = await db.sales.find().to_list(length=100)

    for sale in sales:
        sale["amount"] = sale["amount"].to_decimal()

    return sales


@router.post("/", response_model=SaleResponse)
async def create_sale(sale: Sale):
    now = datetime.now(timezone.utc)
    sale_id = f"{sale.salesperson_id}-{sale.invoice_number}"

    sale_doc = sale.model_dump()
    sale_doc["sale_id"] = sale_id
    sale_doc["amount"] = Decimal128(str(sale.amount))
    sale_doc["created_at"] = now
    sale_doc["updated_at"] = now

    await db.sales.insert_one(sale_doc)

    return SaleResponse(
        **sale.model_dump(),
        sale_id=sale_id,
        created_at=now,
        updated_at=now,
    )
