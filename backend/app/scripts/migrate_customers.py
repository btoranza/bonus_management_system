import random
from datetime import timedelta

from app.database.client import db


async def migrate_customers() -> None:
    sales = (
        await db.sales.find(
            {},
            {
                "_id": 0,
                "customer_id": 1,
                "customer_name": 1,
                "date": 1,
            },
        )
        .sort("date", 1)
        .to_list(None)
    )

    customers = {}

    for sale in sales:
        customer_id = sale["customer_id"]

        if customer_id not in customers:
            first_sale_date = sale["date"]

            days_before = random.randint(1, 90)
            created_at = first_sale_date - timedelta(days=days_before)

            customers[customer_id] = {
                "customer_id": customer_id,
                "customer_name": sale["customer_name"],
                "created_at": created_at,
                "updated_at": created_at,
            }

    print(f"Found {len(customers)} unique customers.")

    await db.customers.delete_many({})

    if customers:
        await db.customers.insert_many(list(customers.values()))

    print(f"Created {len(customers)} customers.")
    print("Customer migration completed.")


if __name__ == "__main__":
    import asyncio

    asyncio.run(migrate_customers())
