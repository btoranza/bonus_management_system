from datetime import datetime, timezone

from bson.decimal128 import Decimal128
from fastapi import APIRouter, HTTPException
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.database.client import db
from app.schemas.sale import Sale, SaleResponse, SaleUpdate

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/", response_model=list[SaleResponse])
async def list_sales():
    sales = await db.sales.find().to_list(length=100)

    for sale in sales:
        sale["amount"] = sale["amount"].to_decimal()

    return sales


@router.post("/", response_model=SaleResponse)
async def create_sale(sale: Sale):
    salesperson = await db.salespeople.find_one({"salesperson_id": sale.salesperson_id})
    if salesperson is None:
        raise HTTPException(
            status_code=404,
            detail=f"Salesperson '{sale.salesperson_id}' not found",
        )

    now = datetime.now(timezone.utc)
    sale_id = f"{sale.salesperson_id}-{sale.invoice_number}"

    sale_doc = sale.model_dump()
    sale_doc["sale_id"] = sale_id
    sale_doc["amount"] = Decimal128(str(sale.amount))
    sale_doc["created_at"] = now
    sale_doc["updated_at"] = now

    try:
        await db.sales.insert_one(sale_doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail=f"Sale '{sale_id}' already exists",
        )

    return SaleResponse(
        **sale.model_dump(),
        sale_id=sale_id,
        created_at=now,
        updated_at=now,
    )


@router.patch("/{sale_id}", response_model=SaleResponse)
async def update_sale(sale_id: str, update: SaleUpdate):
    changes = update.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "amount" in changes:
        changes["amount"] = Decimal128(str(changes["amount"]))

    changes["updated_at"] = datetime.now(timezone.utc)

    sale = await db.sales.find_one_and_update(
        {"sale_id": sale_id},
        {"$set": changes},
        return_document=ReturnDocument.AFTER,
    )

    if sale is None:
        raise HTTPException(status_code=404, detail=f"Sale '{sale_id}' not found")

    sale["amount"] = sale["amount"].to_decimal()
    return sale

