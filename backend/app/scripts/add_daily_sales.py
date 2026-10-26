"""Incremental job that adds today's sales without touching existing data.

Run with (from `backend/`):
    python -m app.scripts.add_daily_sales [--force]

Unlike `seed.py`, this never deletes anything. It generates a few realistic
sales dated today for the active salespeople (reusing the seed's profile
logic), skips weekends, and does nothing if today already has sales (so a
re-run doesn't duplicate them) unless `--force` is passed.
"""

import asyncio
import random
import re
import sys
from datetime import datetime, timezone

from bson import Decimal128

from app.database.client import db
from app.scripts.seed import (
    SALESPEOPLE_SEED,
    SEASONALITY_BY_MONTH,
    TEAM_NEW_CUSTOMER_PROBABILITY,
    _generate_customer,
    _generate_monthly_amounts,
    _generate_monthly_sale_count,
)

WORKING_DAYS_PER_MONTH = 22

PROFILE_BY_SALESPERSON_ID = {
    f"SP-{person['id']}": person["profile"] for person in SALESPEOPLE_SEED
}


async def _next_customer_seq() -> int:
    last = await db.customers.find_one(
        {"customer_id": {"$regex": r"^CUST-\d+$"}},
        sort=[("customer_id", -1)],
    )
    return int(last["customer_id"].split("-")[1]) + 1 if last else 1


async def _next_invoice_counter(year: int, month: int) -> int:
    prefix = f"INV-{year}{month:02d}-"
    pattern = re.compile(rf"^{re.escape(prefix)}(\d+)$")
    counters = [
        int(match.group(1))
        async for doc in db.sales.find(
            {"invoice_number": {"$regex": f"^{re.escape(prefix)}"}},
            {"invoice_number": 1},
        )
        if (match := pattern.match(doc["invoice_number"]))
    ]
    return max(counters, default=0) + 1


def _today_sale_datetime(now: datetime) -> datetime:
    hour = random.randint(8, 18)
    return now.replace(
        hour=hour,
        minute=random.randint(0, 59),
        second=random.randint(0, 59),
        microsecond=0,
    )


async def main(force: bool = False) -> None:
    now = datetime.now(timezone.utc)

    if now.weekday() >= 5:
        print("Weekend: no sales to add.")
        return

    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    if not force and await db.sales.count_documents({"date": {"$gte": day_start}}):
        print("Today already has sales; skipping (use --force to add more).")
        return

    salespeople = await db.salespeople.find(
        {"active": True, "hire_date": {"$lte": now}}
    ).to_list(None)
    existing_customers = await db.customers.find({}, {"customer_id": 1}).to_list(None)
    customer_ids = [c["customer_id"] for c in existing_customers]

    customer_seq = await _next_customer_seq()
    invoice_counter = await _next_invoice_counter(now.year, now.month)
    seasonality = SEASONALITY_BY_MONTH[now.month]

    new_sales: list[dict] = []
    new_customers: list[dict] = []

    for person in salespeople:
        salesperson_id = person["salesperson_id"]
        team = person["team"]
        profile = PROFILE_BY_SALESPERSON_ID.get(salesperson_id, "average")

        # Take a random slice of what this rep would close in a whole month,
        # so daily amounts and volume follow the same profile as the seed.
        monthly_count = _generate_monthly_sale_count(team, profile)
        monthly_amounts = _generate_monthly_amounts(
            team, profile, seasonality, monthly_count
        )
        todays_amounts = [
            amount
            for amount in monthly_amounts
            if random.random() < 1 / WORKING_DAYS_PER_MONTH
        ]

        for amount in todays_amounts:
            sale_date = _today_sale_datetime(now)

            if not customer_ids or random.random() < TEAM_NEW_CUSTOMER_PROBABILITY[team]:
                customer = _generate_customer(customer_seq)
                customer_seq += 1
                customer_ids.append(customer["customer_id"])
                new_customers.append(
                    {
                        **customer,
                        "status": "new",
                        "first_sale_date": sale_date,
                        "created_at": sale_date,
                        "updated_at": sale_date,
                    }
                )
                customer_id = customer["customer_id"]
            else:
                customer_id = random.choice(customer_ids)

            invoice_number = f"INV-{now.year}{now.month:02d}-{invoice_counter:05d}"
            invoice_counter += 1
            new_sales.append(
                {
                    "sale_id": f"{salesperson_id}-{invoice_number}",
                    "invoice_number": invoice_number,
                    "customer_id": customer_id,
                    "salesperson_id": salesperson_id,
                    "team": team,
                    "amount": Decimal128(amount),
                    "date": sale_date,
                    "created_at": sale_date,
                    "updated_at": sale_date,
                }
            )

    if new_customers:
        await db.customers.insert_many(new_customers)
    if new_sales:
        await db.sales.insert_many(new_sales)

    print(f"Added {len(new_sales)} sales and {len(new_customers)} new customers.")


if __name__ == "__main__":
    asyncio.run(main(force="--force" in sys.argv))
