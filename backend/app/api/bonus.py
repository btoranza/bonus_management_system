from datetime import datetime, timezone
from decimal import Decimal

from bson.decimal128 import Decimal128
from fastapi import APIRouter, HTTPException, Query

from app.database.client import db
from app.schemas.bonus import BonusComponent, BonusResponse
from app.schemas.salesperson import Team
from app.services.bonus import calculate_bonus

router = APIRouter(prefix="/bonuses", tags=["bonus"])


def _as_decimal(value: Decimal128 | int | float) -> Decimal:
    # $sum returns Decimal128 only when it actually summed a Decimal128 value;
    # a $cond fallback of a plain 0 can make it return a plain int/float instead.
    return value.to_decimal() if isinstance(value, Decimal128) else Decimal(value)


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

    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)

    pipeline = [
        {"$match": {
            "salesperson_id": salesperson_id,
            "date": {"$gte": start, "$lt": end},
        }},
        {"$facet": {
            "totals": [
                {"$group": {"_id": None, "total_sold": {"$sum": "$amount"}}},
            ],
            # Unique customers behind the "new" sales in the period (a customer
            # with several new-status sales in the same month only counts once).
            "new_customers": [
                {"$match": {"customer_status": "new"}},
                {"$group": {"_id": "$customer_id"}},
                {"$count": "count"},
            ],
        }},
    ]
    result = await db.sales.aggregate(pipeline).to_list(length=1)

    if result:
        totals = result[0]["totals"]
        total_sold = _as_decimal(totals[0]["total_sold"]) if totals else Decimal("0")
        new_customers = result[0]["new_customers"]
        unique_new_customers = new_customers[0]["count"] if new_customers else 0
    else:
        total_sold = Decimal("0")
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
            BonusComponent(type="New Customer Bonus", amount=breakdown.new_customer_bonus),
        ],
        total_bonus=breakdown.total_bonus,
    )
