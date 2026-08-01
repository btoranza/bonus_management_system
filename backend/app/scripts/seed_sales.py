import asyncio
from datetime import datetime, timezone

from bson.decimal128 import Decimal128

from app.database.client import db

sales = [
    # SP-1001 (Enterprise)
    {
        "salesperson_id": "SP-1001",
        "invoice_number": "INV-202607-001",
        "customer_id": "CUST-001",
        "customer_name": "Netflix",
        "customer_status": "Existing",
        "amount": 45000,
        "date": datetime(2026, 7, 5),
    },
    {
        "salesperson_id": "SP-1001",
        "invoice_number": "INV-202607-002",
        "customer_id": "CUST-002",
        "customer_name": "Disney+",
        "customer_status": "New",
        "amount": 70000,
        "date": datetime(2026, 7, 12),
    },
    {
        "salesperson_id": "SP-1001",
        "invoice_number": "INV-202607-003",
        "customer_id": "CUST-003",
        "customer_name": "Apple TV+",
        "customer_status": "Existing",
        "amount": 30000,
        "date": datetime(2026, 7, 24),
    },

    # SP-1002 (SMB)
    {
        "salesperson_id": "SP-1002",
        "invoice_number": "INV-202607-004",
        "customer_id": "CUST-004",
        "customer_name": "Local Media",
        "customer_status": "Existing",
        "amount": 25000,
        "date": datetime(2026, 7, 8),
    },
    {
        "salesperson_id": "SP-1002",
        "invoice_number": "INV-202607-005",
        "customer_id": "CUST-005",
        "customer_name": "Startup TV",
        "customer_status": "New",
        "amount": 22000,
        "date": datetime(2026, 7, 16),
    },
    {
        "salesperson_id": "SP-1002",
        "invoice_number": "INV-202607-006",
        "customer_id": "CUST-006",
        "customer_name": "Regional Sports",
        "customer_status": "Existing",
        "amount": 18000,
        "date": datetime(2026, 7, 27),
    },

    # SP-1003 (Mid-Market)
    {
        "salesperson_id": "SP-1003",
        "invoice_number": "INV-202607-007",
        "customer_id": "CUST-007",
        "customer_name": "News Group",
        "customer_status": "Existing",
        "amount": 15000,
        "date": datetime(2026, 7, 6),
    },
    {
        "salesperson_id": "SP-1003",
        "invoice_number": "INV-202607-008",
        "customer_id": "CUST-008",
        "customer_name": "Radio One",
        "customer_status": "Existing",
        "amount": 12000,
        "date": datetime(2026, 7, 20),
    },

    # SP-1004 (Enterprise)
    {
        "salesperson_id": "SP-1004",
        "invoice_number": "INV-202607-009",
        "customer_id": "CUST-009",
        "customer_name": "Amazon Prime Video",
        "customer_status": "New",
        "amount": 95000,
        "date": datetime(2026, 7, 4),
    },
    {
        "salesperson_id": "SP-1004",
        "invoice_number": "INV-202607-010",
        "customer_id": "CUST-010",
        "customer_name": "HBO Max",
        "customer_status": "Existing",
        "amount": 65000,
        "date": datetime(2026, 7, 18),
    },
    {
        "salesperson_id": "SP-1004",
        "invoice_number": "INV-202607-011",
        "customer_id": "CUST-011",
        "customer_name": "Paramount+",
        "customer_status": "New",
        "amount": 55000,
        "date": datetime(2026, 7, 29),
    },
]


async def main():
    await db.sales.delete_many({})

    now = datetime.now(timezone.utc)
    for sale in sales:
        sale["sale_id"] = f"{sale['salesperson_id']}-{sale['invoice_number']}"
        sale["customer_status"] = sale["customer_status"].lower()
        sale["amount"] = Decimal128(str(sale["amount"]))
        sale["created_at"] = now
        sale["updated_at"] = now

    result = await db.sales.insert_many(sales)

    print(f"Inserted {len(result.inserted_ids)} sales.")


if __name__ == "__main__":
    asyncio.run(main())