from datetime import datetime
from decimal import ROUND_HALF_UP, Decimal

from app.database.client import db
from app.schemas.salesperson import Team
from app.schemas.dashboard import (
    DashboardResponse,
    TeamAchievement,
    TeamBonus,
    TeamSales,
    TopSalesperson,
    TrendPoint,
)
from app.services.bonus import TEAM_MONTHLY_GOALS, calculate_bonus

TREND_MONTHS = 6


def _month_bounds(year: int, month: int) -> tuple[datetime, datetime]:
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    return start_date, end_date


def _shift_month(year: int, month: int, delta: int) -> tuple[int, int]:
    total = year * 12 + (month - 1) + delta
    return total // 12, total % 12 + 1


def _pct_change(current: Decimal, previous: Decimal) -> Decimal | None:
    if previous == 0:
        return None
    change = (current - previous) / previous * 100
    return change.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


async def _aggregate_sales(year: int, month: int) -> list[dict]:
    start_date, end_date = _month_bounds(year, month)

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

    return results


def _enrich_with_bonus(results: list[dict], salespeople_map: dict) -> None:
    for result in results:
        salesperson = salespeople_map.get(result["salesperson_id"])
        if salesperson is None:
            continue

        team = Team(salesperson["team"])
        bonus = calculate_bonus(
            total_sold=result["total_sales"],
            unique_new_customers=result["new_customers_count"],
            team=team,
        )

        result["bonus"] = bonus.total_bonus
        result["team"] = team


async def get_dashboard_summary(year: int, month: int) -> DashboardResponse:
    salespeople = await db.salespeople.find({"active": True}).to_list(None)
    salespeople_map = {
        salesperson["salesperson_id"]: salesperson
        for salesperson in salespeople
    }

    results = await _aggregate_sales(year, month)
    _enrich_with_bonus(results, salespeople_map)

    prev_year, prev_month = _shift_month(year, month, -1)
    prev_results = await _aggregate_sales(prev_year, prev_month)
    _enrich_with_bonus(prev_results, salespeople_map)

    total_sales = sum((item["total_sales"] for item in results), Decimal("0"))
    total_bonus = sum((item["bonus"] for item in results), Decimal("0"))
    sales_count = sum(item["sales_count"] for item in results)
    new_customers_count = sum(item["new_customers_count"] for item in results)
    salespeople_count = len(salespeople)
    average_sale = total_sales / sales_count if sales_count else Decimal("0")

    goal_achievers_count = sum(
        1
        for item in results
        if item["total_sales"] >= TEAM_MONTHLY_GOALS[item["team"]]
    )

    prev_total_sales = sum((item["total_sales"] for item in prev_results), Decimal("0"))
    prev_total_bonus = sum((item["bonus"] for item in prev_results), Decimal("0"))
    prev_sales_count = sum(item["sales_count"] for item in prev_results)
    prev_new_customers_count = sum(item["new_customers_count"] for item in prev_results)
    prev_average_sale = (
        prev_total_sales / prev_sales_count if prev_sales_count else Decimal("0")
    )

    sales_by_team = []
    bonus_by_team = []
    goal_achievement_by_team = []
    for team in Team:
        team_results = [item for item in results if item.get("team") == team]
        team_total_sales = sum((item["total_sales"] for item in team_results), Decimal("0"))
        team_total_bonus = sum((item["bonus"] for item in team_results), Decimal("0"))
        team_goal = TEAM_MONTHLY_GOALS[team]
        achievement_pct = (
            (team_total_sales / team_goal * 100).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            if team_goal
            else Decimal("0")
        )

        sales_by_team.append(TeamSales(team=team, total_sales=team_total_sales))
        bonus_by_team.append(TeamBonus(team=team, total_bonus=team_total_bonus))
        goal_achievement_by_team.append(
            TeamAchievement(team=team, achievement_pct=achievement_pct)
        )

    top_results = sorted(results, key=lambda item: item["total_sales"], reverse=True)[:5]
    top_salespeople = [
        TopSalesperson(
            salesperson_id=item["salesperson_id"],
            name=(
                f"{salespeople_map[item['salesperson_id']]['first_name']} "
                f"{salespeople_map[item['salesperson_id']]['last_name']}"
            ),
            team=item["team"],
            total_sales=item["total_sales"],
            bonus=item["bonus"],
        )
        for item in top_results
    ]

    sales_trend = []
    for offset in range(TREND_MONTHS - 1, -1, -1):
        trend_year, trend_month = _shift_month(year, month, -offset)
        if offset == 0:
            trend_results = results
        else:
            trend_results = await _aggregate_sales(trend_year, trend_month)
        trend_total_sales = sum(
            (item["total_sales"] for item in trend_results), Decimal("0")
        )
        label = datetime(trend_year, trend_month, 1).strftime("%b")
        sales_trend.append(TrendPoint(period=label, total_sales=trend_total_sales))

    return DashboardResponse(
        period=f"{year}-{month:02d}",
        total_sales=total_sales,
        total_sales_change_pct=_pct_change(total_sales, prev_total_sales),
        total_bonus=total_bonus,
        total_bonus_change_pct=_pct_change(total_bonus, prev_total_bonus),
        sales_count=sales_count,
        sales_count_change_pct=_pct_change(Decimal(sales_count), Decimal(prev_sales_count)),
        salespeople_count=salespeople_count,
        new_customers_count=new_customers_count,
        new_customers_change_pct=_pct_change(
            Decimal(new_customers_count), Decimal(prev_new_customers_count)
        ),
        average_sale=average_sale,
        average_sale_change_pct=_pct_change(average_sale, prev_average_sale),
        goal_achievers_count=goal_achievers_count,
        sales_by_team=sales_by_team,
        bonus_by_team=bonus_by_team,
        goal_achievement_by_team=goal_achievement_by_team,
        top_salespeople=top_salespeople,
        sales_trend=sales_trend,
    )