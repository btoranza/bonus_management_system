import asyncio

from app.database.client import db


async def cleanup_sales():
    result = await db.sales.update_many(
        {},
        {"$unset": {"customer_name": "", "customer_status": ""}},
    )

    print(f"Updated {result.modified_count} sales.")


if __name__ == "__main__":
    asyncio.run(cleanup_sales())
