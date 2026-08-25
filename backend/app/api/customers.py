from datetime import datetime, timezone
import re
from math import ceil

from fastapi import APIRouter, Query

from app.database.client import db
from app.schemas.customer import (
    CustomerCreate,
    CustomerResponse,
    PaginatedCustomersResponse,
)

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/", response_model=PaginatedCustomersResponse)
async def list_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
):
    query: dict = {}

    if search:
        search_regex = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [
            {"customer_id": search_regex},
            {"customer_name": search_regex},
        ]

    total = await db.customers.count_documents(query)

    skip = (page - 1) * limit

    customers = await (
        db.customers.find(query)
        .sort("customer_name", 1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    return PaginatedCustomersResponse(
        items=customers,
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit) if total else 0,
    )


@router.post("/", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate):
    last_customer = await db.customers.find_one(sort=[("customer_id", -1)])

    next_number = (
        int(last_customer["customer_id"].split("-")[1]) + 1 if last_customer else 1
    )

    customer_id = f"CUST-{next_number:06d}"

    now = datetime.now(timezone.utc)

    customer_doc = {
        "customer_id": customer_id,
        "customer_name": customer.customer_name,
        "created_at": now,
        "updated_at": now,
    }

    await db.customers.insert_one(customer_doc)

    return customer_doc
