import asyncio
import random
from datetime import datetime, timedelta
from bson.decimal128 import Decimal128

from app.database.client import db

# ----------------------------
# Configuración
# ----------------------------

START_DATE = datetime(2025, 8, 2)
END_DATE = datetime(2026, 8, 2)

INVOICE_START = 100000

salespeople = [f"SP-{i}" for i in range(1001, 1016)]

# Repartimos aleatoriamente los vendedores entre los equipos
random.shuffle(salespeople)

salesperson_team = {}

for sp in salespeople[:5]:
    salesperson_team[sp] = "enterprise"

for sp in salespeople[5:10]:
    salesperson_team[sp] = "mid_market"

for sp in salespeople[10:]:
    salesperson_team[sp] = "smb"

# Algunos vendedores venden más que otros
salesperson_weights = {
    sp: random.uniform(0.6, 1.8)
    for sp in salespeople
}

# ----------------------------
# Customers
# ----------------------------

enterprise_customers = [
    "Netflix",
    "Microsoft",
    "Google",
    "Amazon",
    "Airbus",
    "Siemens",
    "BMW",
    "Orange",
    "AXA",
    "Carrefour",
]

mid_market_customers = [
    "Nova Logistics",
    "GreenTech",
    "BlueSoft",
    "Pixel Agency",
    "Smart Energy",
    "Urban Mobility",
    "Bright Media",
    "FoodHub",
    "Cloud Vision",
    "Next Solutions",
    "Peak Systems",
    "Data Partners",
    "Digital Labs",
    "Flex Retail",
    "Core Finance",
]

smb_customers = [
    "Cafe Central",
    "Alpha Bakery",
    "Fresh Market",
    "City Gym",
    "Studio Pixel",
    "Pet House",
    "Sun Travel",
    "Bella Moda",
    "Coffee Point",
    "Urban Flowers",
    "Tech Corner",
    "Green Garden",
    "Happy Pets",
    "Creative Studio",
    "Local Books",
    "Quick Repairs",
    "Smile Dental",
    "Art Printing",
    "Fresh Laundry",
    "Speed Auto",
    "Pizza Roma",
    "Fit Club",
    "Kids Academy",
    "Sunny Hostel",
    "Beauty Care",
]

customers = []
customer_number = 1

for team, names in [
    ("enterprise", enterprise_customers),
    ("mid_market", mid_market_customers),
    ("smb", smb_customers),
]:
    for name in names:
        customers.append(
            {
                "customer_id": f"CUST-{customer_number:03}",
                "customer_name": name,
                "team": team,
                "has_bought": False,
            }
        )
        customer_number += 1

customers_by_team = {
    "enterprise": [c for c in customers if c["team"] == "enterprise"],
    "mid_market": [c for c in customers if c["team"] == "mid_market"],
    "smb": [c for c in customers if c["team"] == "smb"],
}

sales_distribution = {
    "enterprise": 180,
    "mid_market": 320,
    "smb": 500,
}


# ----------------------------
# Helpers
# ----------------------------

def random_date():
    delta = END_DATE - START_DATE
    seconds = random.randint(0, int(delta.total_seconds()))
    return START_DATE + timedelta(seconds=seconds)


def random_amount(team):
    if team == "smb":
        value = random.randint(5, 40)

    elif team == "mid_market":
        value = random.randint(30, 150)

    else:
        if random.random() < 0.03:
            value = random.randint(1000, 1500)
        else:
            value = random.randint(120, 800)

    return Decimal128(str(value * 1000))


# ----------------------------
# Script principal
# ----------------------------

async def main():

    await db.sales.delete_many({})

    documents = []
    invoice_number = INVOICE_START

    for team, total_sales in sales_distribution.items():

        team_salespeople = [
            sp
            for sp in salespeople
            if salesperson_team[sp] == team
        ]

        weights = [
            salesperson_weights[sp]
            for sp in team_salespeople
        ]

        for _ in range(total_sales):

            salesperson = random.choices(
                team_salespeople,
                weights=weights,
                k=1,
            )[0]

            customer = random.choice(customers_by_team[team])

            customer_status = (
                "existing"
                if customer["has_bought"]
                else "new"
            )

            customer["has_bought"] = True

            sale_date = random_date()

            documents.append(
                {
                    "salesperson_id": salesperson,
                    "invoice_number": invoice_number,
                    "customer_id": customer["customer_id"],
                    "customer_name": customer["customer_name"],
                    "customer_status": customer_status,
                    "amount": random_amount(team),
                    "date": sale_date,
                    "sale_id": f"{salesperson}-{invoice_number}",
                    "created_at": sale_date,
                    "updated_at": sale_date,
                }
            )

            invoice_number += 1

    documents.sort(key=lambda x: x["date"])

    result = await db.sales.insert_many(documents)

    print(f"Inserted {len(result.inserted_ids)} sales.")


if __name__ == "__main__":
    asyncio.run(main())