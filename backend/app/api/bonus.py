from datetime import datetime, timezone
from decimal import Decimal
from math import ceil

from bson.decimal128 import Decimal128
from fastapi import APIRouter, HTTPException, Query

from app.database.client import db
from app.schemas.bonus import (
    BonusComponent,
    BonusListItem,
    BonusResponse,
    PaginatedBonusesResponse,
)
from app.schemas.salesperson import Team
from app.services.bonus import calculate_bonus

router = APIRouter(prefix="/bonuses", tags=["bonus"])

SORTABLE_FIELDS = {"salesperson_name", "total_sold", "total_bonus"}
SORT_ORDERS = {"asc": False, "desc": True}


def _as_decimal(value: Decimal128 | float) -> Decimal:
    return value.to_decimal() if isinstance(value, Decimal128) else Decimal(value)


def _get_period_range(year: int, month: int) -> tuple[datetime, datetime]:
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    return start, end


def _salesperson_name(salesperson: dict) -> str:
    return f"{salesperson['first_name']} {salesperson['last_name']}"


@router.get("/", response_model=PaginatedBonusesResponse)
async def list_bonuses(
    year: int,
    month: int = Query(ge=1, le=12),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    team: Team | None = None,
    sort: str | None = None,
    order: str = "desc",
):
    if sort is not None and sort not in SORTABLE_FIELDS:
        raise HTTPException(status_code=400, detail=f"Invalid sort field '{sort}'")

    if order is not None and order not in SORT_ORDERS:
        raise HTTPException(status_code=400, detail=f"Invalid order '{order}'")

    sort_field = sort or "total_bonus"
    reverse = SORT_ORDERS[order] if order else True
    salespeople_query: dict = {}

    if team:
        salespeople_query["team"] = team

    salespeople = await db.salespeople.find(salespeople_query).to_list(length=None)

    if search:
        search = search.lower()

        salespeople = [
            salesperson
            for salesperson in salespeople
            if (
                search in salesperson["salesperson_id"].lower()
                or search in salesperson["first_name"].lower()
                or search in salesperson["last_name"].lower()
            )
        ]

    start, end = _get_period_range(year, month)

    pipeline = [
        {
            "$match": {
                "date": {
                    "$gte": start,
                    "$lt": end,
                }
            }
        },
        {
            "$facet": {
                "totals": [
                    {
                        "$group": {
                            "_id": "$salesperson_id",
                            "total_sold": {"$sum": "$amount"},
                        }
                    }
                ],
                "new_customers": [
                    {
                        "$lookup": {
                            "from": "customers",
                            "localField": "customer_id",
                            "foreignField": "customer_id",
                            "as": "customer",
                        }
                    },
                    {"$unwind": "$customer"},
                    {
                        "$match": {
                            "customer.status": "new",
                            "customer.first_sale_date": {"$gte": start, "$lt": end},
                        }
                    },
                    {
                        "$group": {
                            "_id": {
                                "salesperson_id": "$salesperson_id",
                                "customer_id": "$customer_id",
                            }
                        }
                    },
                    {
                        "$group": {
                            "_id": "$_id.salesperson_id",
                            "count": {"$sum": 1},
                        }
                    },
                ],
            }
        },
    ]

    result = await db.sales.aggregate(pipeline).to_list(length=1)

    totals = result[0]["totals"] if result else []
    new_customers = result[0]["new_customers"] if result else []

    totals_by_salesperson = {
        item["_id"]: _as_decimal(item["total_sold"]) for item in totals
    }

    new_customers_by_salesperson = {
        item["_id"]: item["count"] for item in new_customers
    }

    items: list[BonusListItem] = []

    for salesperson in salespeople:
        salesperson_id = salesperson["salesperson_id"]

        total_sold = totals_by_salesperson.get(
            salesperson_id,
            Decimal(0),
        )

        unique_new_customers = new_customers_by_salesperson.get(
            salesperson_id,
            0,
        )

        breakdown = calculate_bonus(
            total_sold=total_sold,
            unique_new_customers=unique_new_customers,
            team=Team(salesperson["team"]),
        )

        items.append(
            BonusListItem(
                salesperson_id=salesperson_id,
                salesperson_name=_salesperson_name(salesperson),
                team=Team(salesperson["team"]),
                total_sold=total_sold,
                base_bonus=breakdown.base_bonus,
                new_customer_bonus=breakdown.new_customer_bonus,
                total_bonus=breakdown.total_bonus,
            )
        )

    items.sort(
        key=lambda item: getattr(item, sort_field),
        reverse=reverse,
    )

    total = len(items)

    start_index = (page - 1) * limit
    end_index = start_index + limit

    paginated_items = items[start_index:end_index]

    return PaginatedBonusesResponse(
        items=paginated_items,
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit) if total else 0,
    )


@router.get("/{salesperson_id}", response_model=BonusResponse)
async def get_salesperson_bonus(
    salesperson_id: str,
    year: int,
    month: int = Query(ge=1, le=12),
):
    salesperson = await db.salespeople.find_one({"salesperson_id": salesperson_id})
    if salesperson is None:
        raise HTTPException(
            status_code=404,
            detail=f"Salesperson '{salesperson_id}' not found",
        )

    start, end = _get_period_range(year, month)

    pipeline = [
        {
            "$match": {
                "salesperson_id": salesperson_id,
                "date": {"$gte": start, "$lt": end},
            }
        },
        {
            "$facet": {
                "totals": [
                    {
                        "$group": {
                            "_id": None,
                            "total_sold": {"$sum": "$amount"},
                        }
                    }
                ],
                "new_customers": [
                    {
                        "$lookup": {
                            "from": "customers",
                            "localField": "customer_id",
                            "foreignField": "customer_id",
                            "as": "customer",
                        }
                    },
                    {"$unwind": "$customer"},
                    {
                        "$match": {
                            "customer.status": "new",
                            "customer.first_sale_date": {"$gte": start, "$lt": end},
                        }
                    },
                    {"$group": {"_id": "$customer_id"}},
                    {"$count": "count"},
                ],
            }
        },
    ]

    result = await db.sales.aggregate(pipeline).to_list(length=1)

    if result:
        totals = result[0]["totals"]
        total_sold = _as_decimal(totals[0]["total_sold"]) if totals else Decimal(0)
        new_customers = result[0]["new_customers"]
        unique_new_customers = new_customers[0]["count"] if new_customers else 0
    else:
        total_sold = Decimal(0)
        unique_new_customers = 0

    breakdown = calculate_bonus(
        total_sold=total_sold,
        unique_new_customers=unique_new_customers,
        team=Team(salesperson["team"]),
    )

    return BonusResponse(
        salesperson_id=salesperson_id,
        period=f"{year}-{month:02d}",
        total_sold=total_sold,
        components=[
            BonusComponent(type="Base Bonus", amount=breakdown.base_bonus),
            BonusComponent(
                type="New Customer Bonus",
                amount=breakdown.new_customer_bonus,
            ),
        ],
        total_bonus=breakdown.total_bonus,
    )
