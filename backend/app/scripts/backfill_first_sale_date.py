"""Backfill `first_sale_date` on existing customers from their earliest sale.

Run with:
    python app/scripts/backfill_first_sale_date.py
"""

import asyncio

from app.database.client import db


async def backfill_first_sale_date():
    pipeline = [
        {"$group": {"_id": "$customer_id", "first_sale_date": {"$min": "$date"}}}
    ]

    first_sale_dates = await db.sales.aggregate(pipeline).to_list(None)

    updated = 0
    for entry in first_sale_dates:
        result = await db.customers.update_one(
            {"customer_id": entry["_id"]},
            {"$set": {"first_sale_date": entry["first_sale_date"]}},
        )
        updated += result.modified_count

    print(f"Updated {updated} customers with first_sale_date.")


if __name__ == "__main__":
    asyncio.run(backfill_first_sale_date())
