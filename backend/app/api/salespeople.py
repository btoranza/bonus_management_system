import re
from math import ceil

from fastapi import APIRouter, Query

from app.database.client import db
from app.schemas.salesperson import (
    PaginatedSalespeopleResponse,
    Team,
)

router = APIRouter(prefix="/salespeople", tags=["salespeople"])


@router.get("/", response_model=PaginatedSalespeopleResponse)
async def list_salespeople(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    team: Team | None = None,
    sort: str | None = None,
    order: str = "asc",
):
    query: dict = {}

    if search:
        search_regex = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [
            {"salesperson_id": search_regex},
            {"first_name": search_regex},
            {"last_name": search_regex},
            {"email": search_regex},
        ]

    if team:
        query["team"] = team

    allowed_sort_fields = {"first_name", "hire_date"}

    if sort and sort not in allowed_sort_fields:
        sort = "first_name"

    sort_field = sort or "first_name"
    sort_direction = 1 if order == "asc" else -1

    total = await db.salespeople.count_documents(query)

    skip = (page - 1) * limit

    salespeople = await (
        db.salespeople.find(query)
        .sort(sort_field, sort_direction)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    return PaginatedSalespeopleResponse(
        items=salespeople,
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit) if total else 0,
    )
