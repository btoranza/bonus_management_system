import re
from datetime import datetime, timezone
from math import ceil

from bson.decimal128 import Decimal128
from fastapi import APIRouter, HTTPException, Query
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.database.client import db
from app.schemas.sale import (
    PaginatedSalesResponse,
    Sale,
    SaleResponse,
    SaleUpdate,
)
from app.schemas.salesperson import Team
from app.services.dashboard import month_bounds

router = APIRouter(prefix="/sales", tags=["sales"])

SORTABLE_FIELDS = {"date", "amount"}
SORT_ORDERS = {"asc": 1, "desc": -1}


def _salesperson_name(salesperson: dict) -> str:
    return f"{salesperson['first_name']} {salesperson['last_name']}"


@router.get("/", response_model=PaginatedSalesResponse)
async def list_sales(
    year: int,
    month: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    team: str | None = None,
    sort: str | None = None,
    order: str | None = None,
):
    if sort is not None and sort not in SORTABLE_FIELDS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort field '{sort}'",
        )

    if order is not None and order not in SORT_ORDERS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid order '{order}'",
        )

    sort_field = sort or "date"
    sort_direction = SORT_ORDERS[order] if order else -1

    start_date, end_date = month_bounds(year, month)

    query: dict = {
        "date": {
            "$gte": start_date,
            "$lt": end_date,
        }
    }

    if search:
        search_regex = {
            "$regex": re.escape(search),
            "$options": "i",
        }

        salespeople_by_name = await db.salespeople.find(
            {},
            {
                "salesperson_id": 1,
                "first_name": 1,
                "last_name": 1,
            },
        ).to_list(length=None)

        matching_salesperson_ids = [
            salesperson["salesperson_id"]
            for salesperson in salespeople_by_name
            if search.lower() in _salesperson_name(salesperson).lower()
        ]

        matching_customers = await db.customers.find(
            {"customer_name": search_regex},
            {"customer_id": 1},
        ).to_list(length=None)

        matching_customer_ids = [
            customer["customer_id"] for customer in matching_customers
        ]

        query["$or"] = [
            {"invoice_number": search_regex},
            {"customer_id": {"$in": matching_customer_ids}},
            {"salesperson_id": search_regex},
            {"salesperson_id": {"$in": matching_salesperson_ids}},
        ]

    if team:
        query["team"] = Team(team)

    total = await db.sales.count_documents(query)

    skip = (page - 1) * limit

    sales = await (
        db.sales.find(query)
        .sort(sort_field, sort_direction)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    salespeople = await db.salespeople.find(
        {"salesperson_id": {"$in": [sale["salesperson_id"] for sale in sales]}}
    ).to_list(length=None)

    salespeople_map = {
        salesperson["salesperson_id"]: salesperson for salesperson in salespeople
    }

    customers = await db.customers.find(
        {"customer_id": {"$in": [sale["customer_id"] for sale in sales]}}
    ).to_list(length=None)

    customers_map = {customer["customer_id"]: customer for customer in customers}

    for sale in sales:
        customer = customers_map.get(sale["customer_id"])
        salesperson = salespeople_map.get(sale["salesperson_id"])

        if customer is None:
            raise HTTPException(
                status_code=404,
                detail=f"Customer '{sale['customer_id']}' not found",
            )

        if salesperson is None:
            raise HTTPException(
                status_code=404,
                detail=f"Salesperson '{sale['salesperson_id']}' not found",
            )

        sale["amount"] = sale["amount"].to_decimal()
        sale["customer_name"] = customer["customer_name"]
        sale["salesperson_name"] = _salesperson_name(salesperson)

    return PaginatedSalesResponse(
        items=sales,
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit) if total else 0,
    )


@router.post("/", response_model=SaleResponse)
async def create_sale(sale: Sale):
    salesperson = await db.salespeople.find_one({"salesperson_id": sale.salesperson_id})

    if salesperson is None:
        raise HTTPException(
            status_code=404,
            detail=f"Salesperson '{sale.salesperson_id}' not found",
        )

    customer = await db.customers.find_one({"customer_id": sale.customer_id})

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{sale.customer_id}' not found",
        )

    now = datetime.now(timezone.utc)

    sale_id = f"{sale.salesperson_id}-{sale.invoice_number}"

    team = Team(salesperson["team"])

    sale_doc = sale.model_dump()
    sale_doc["sale_id"] = sale_id
    sale_doc["amount"] = Decimal128(str(sale.amount))
    sale_doc["team"] = team
    sale_doc["created_at"] = now
    sale_doc["updated_at"] = now

    try:
        await db.sales.insert_one(sale_doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail=f"Sale '{sale_id}' already exists",
        )

    # $min sets first_sale_date on first insert and keeps the earliest date afterwards
    await db.customers.update_one(
        {"customer_id": sale.customer_id},
        {"$min": {"first_sale_date": sale.date}},
    )

    return SaleResponse(
        **sale.model_dump(),
        customer_name=customer["customer_name"],
        sale_id=sale_id,
        salesperson_name=_salesperson_name(salesperson),
        team=team,
        created_at=now,
        updated_at=now,
    )


@router.patch("/{sale_id}", response_model=SaleResponse)
async def update_sale(
    sale_id: str,
    update: SaleUpdate,
):
    changes = update.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="No fields to update",
        )

    if "amount" in changes:
        changes["amount"] = Decimal128(str(changes["amount"]))

    changes["updated_at"] = datetime.now(timezone.utc)

    sale = await db.sales.find_one_and_update(
        {"sale_id": sale_id},
        {"$set": changes},
        return_document=ReturnDocument.AFTER,
    )

    if sale is None:
        raise HTTPException(
            status_code=404,
            detail=f"Sale '{sale_id}' not found",
        )

    salesperson = await db.salespeople.find_one(
        {"salesperson_id": sale["salesperson_id"]}
    )

    if salesperson is None:
        raise HTTPException(
            status_code=404,
            detail=f"Salesperson '{sale['salesperson_id']}' not found",
        )

    customer = await db.customers.find_one({"customer_id": sale["customer_id"]})

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{sale['customer_id']}' not found",
        )

    sale["amount"] = sale["amount"].to_decimal()
    sale["customer_name"] = customer["customer_name"]
    sale["salesperson_name"] = _salesperson_name(salesperson)

    return sale
