from datetime import datetime
from decimal import Decimal

from app.database.client import db
from app.schemas.salesperson import Team
from app.schemas.dashboard import DashboardResponse, TopSalesperson
from app.services.bonus import TEAM_MONTHLY_GOALS, calculate_bonus


async def get_dashboard_summary(year: int, month: int):
    start_date = datetime(year, month, 1)

    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    pipeline = [
        {
            "$match": {
                "date": {
                    "$gte": start_date,
                    "$lt": end_date,
                }
            }
        },
        {
            "$group": {
                "_id": "$salesperson_id",
                "total_sales": {"$sum": "$amount"},
                "sales_count": {"$sum": 1},
                "new_customers": {
                    "$addToSet": {
                        "$cond": [
                            {"$eq": ["$customer_status", "new"]},
                            "$customer_id",
                            "$$REMOVE",
                        ]
                    }
                },
            }
        },
        {
            "$project": {
                "_id": 0,
                "salesperson_id": "$_id",
                "total_sales": 1,
                "sales_count": 1,
                "new_customers_count": {
                    "$size": "$new_customers"
                },
            }
        },
    ]

    results = await db.sales.aggregate(pipeline).to_list(None)

    for result in results:
        result["total_sales"] = result["total_sales"].to_decimal()

    salespeople = await db.salespeople.find().to_list(None)

    salespeople_map = {
        salesperson["salesperson_id"]: salesperson
        for salesperson in salespeople
    }

    total_bonus = Decimal("0")
    goal_achievers_count = 0

    for result in results:
        salesperson = salespeople_map[result["salesperson_id"]]

        team = Team(salesperson["team"])

        bonus = calculate_bonus(
            total_sold=result["total_sales"],
            unique_new_customers=result["new_customers_count"],
            team=team,
        )

        result["bonus"] = bonus.total_bonus
        result["team"] = team

        total_bonus += bonus.total_bonus

        if result["total_sales"] >= TEAM_MONTHLY_GOALS[team]:
            goal_achievers_count += 1

    total_sales = sum(item["total_sales"] for item in results)
    salespeople_count = len(results)
    sales_count = sum(item["sales_count"] for item in results)
    new_customers_count = sum(item["new_customers_count"] for item in results)

    top_salesperson = max(results, key=lambda item: item["total_sales"])

    print(f"Total Sales: {total_sales}")
    print(f"Total Bonus: {total_bonus}")
    print(f"Salespeople Count: {salespeople_count}")
    print(f"Sales Count: {sales_count}")
    print(f"New Customers Count: {new_customers_count}")
    print(f"Goal Achievers: {goal_achievers_count}")
    print(
        f"Top Salesperson: "
        f"{salespeople_map[top_salesperson['salesperson_id']]['first_name']} "
        f"{salespeople_map[top_salesperson['salesperson_id']]['last_name']}"
    )

    return DashboardResponse(
      period=f"{year}-{month:02d}",
      total_sales=total_sales,
      total_bonus=total_bonus,
      sales_count=sales_count,
      salespeople_count=salespeople_count,
      new_customers_count=new_customers_count,
      goal_achievers_count=goal_achievers_count,
      top_salesperson=TopSalesperson(
          salesperson_id=top_salesperson["salesperson_id"],
          name=f"{salespeople_map[top_salesperson['salesperson_id']]['first_name']} {salespeople_map[top_salesperson['salesperson_id']]['last_name']}",
          total_sales=top_salesperson["total_sales"],
          bonus=top_salesperson["bonus"],
    ),
)