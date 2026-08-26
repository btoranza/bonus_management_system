from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal

from app.database.client import db
from app.schemas.dashboard import (
    DashboardResponse,
    TeamAchievement,
    TeamAverageSale,
    TeamBonus,
    TeamNewCustomers,
    TeamSales,
    TopPerformer,
    TrendPoint,
)
from app.schemas.salesperson import Team
from app.services.bonus import TEAM_MONTHLY_GOALS, calculate_bonus

TREND_MONTHS = 6


def month_bounds(year: int, month: int) -> tuple[datetime, datetime]:
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end_date = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    return start_date, end_date


def _shift_month(year: int, month: int, delta: int) -> tuple[int, int]:
    total = year * 12 + (month - 1) + delta
    return total // 12, total % 12 + 1


def _pct_change(current: Decimal, previous: Decimal) -> Decimal | None:
    if previous == 0:
        return None
    change = (current - previous) / previous * 100
    return change.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _achievement_pct(total_sales: Decimal, goal: Decimal) -> Decimal:
    if not goal:
        return Decimal(0)
    return (total_sales / goal * 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


async def _aggregate_sales(year: int, month: int) -> list[dict]:
    start_date, end_date = month_bounds(year, month)

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
            "$lookup": {
                "from": "customers",
                "localField": "customer_id",
                "foreignField": "customer_id",
                "as": "customer",
            }
        },
        {"$unwind": "$customer"},
        {
            "$group": {
                "_id": {
                    "salesperson_id": "$salesperson_id",
                    "team": "$team",
                },
                "total_sales": {"$sum": "$amount"},
                "sales_count": {"$sum": 1},
                "new_customers": {
                    "$addToSet": {
                        "$cond": [
                            {"$eq": ["$customer.status", "new"]},
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
                "salesperson_id": "$_id.salesperson_id",
                "team": "$_id.team",
                "total_sales": 1,
                "sales_count": 1,
                "new_customers_count": {"$size": "$new_customers"},
            }
        },
    ]

    results = await db.sales.aggregate(pipeline).to_list(None)

    for result in results:
        result["total_sales"] = result["total_sales"].to_decimal()
        result["team"] = Team(result["team"])

    return results


def _enrich_with_bonus(results: list[dict], salespeople_map: dict) -> None:
    for result in results:
        if result["salesperson_id"] not in salespeople_map:
            continue

        bonus = calculate_bonus(
            total_sold=result["total_sales"],
            unique_new_customers=result["new_customers_count"],
            team=result["team"],
        )

        result["bonus"] = bonus.total_bonus


async def get_dashboard_summary(year: int, month: int) -> DashboardResponse:
    _, period_end = month_bounds(year, month)
    salespeople = await db.salespeople.find(
        {"active": True, "hire_date": {"$lt": period_end}}
    ).to_list(None)
    salespeople_map = {
        salesperson["salesperson_id"]: salesperson for salesperson in salespeople
    }

    results = await _aggregate_sales(year, month)
    _enrich_with_bonus(results, salespeople_map)

    prev_year, prev_month = _shift_month(year, month, -1)
    prev_results = await _aggregate_sales(prev_year, prev_month)
    _enrich_with_bonus(prev_results, salespeople_map)

    total_sales = sum((item["total_sales"] for item in results), Decimal(0))
    total_bonus = sum((item["bonus"] for item in results), Decimal(0))
    sales_count = sum(item["sales_count"] for item in results)
    salespeople_count = len(salespeople)

    goal_achievers_count = sum(
        1 for item in results if item["total_sales"] >= TEAM_MONTHLY_GOALS[item["team"]]
    )

    prev_total_sales = sum((item["total_sales"] for item in prev_results), Decimal(0))
    prev_total_bonus = sum((item["bonus"] for item in prev_results), Decimal(0))
    prev_sales_count = sum(item["sales_count"] for item in prev_results)

    sales_by_team = []
    bonus_by_team = []
    goal_achievement_by_team = []
    average_sale_by_team = []
    new_customers_by_team = []
    for team in Team:
        team_results = [item for item in results if item.get("team") == team]
        team_total_sales = sum(
            (item["total_sales"] for item in team_results), Decimal(0)
        )
        team_total_bonus = sum((item["bonus"] for item in team_results), Decimal(0))
        team_sales_count = sum(item["sales_count"] for item in team_results)
        team_salespeople_count = len(team_results)
        team_goal = TEAM_MONTHLY_GOALS[team] * team_salespeople_count
        achievement_pct = _achievement_pct(
            team_total_sales,
            team_goal,
        )
        team_average_sale = (
            (team_total_sales / team_sales_count).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            if team_sales_count
            else Decimal(0)
        )

        prev_team_results = [item for item in prev_results if item.get("team") == team]
        prev_team_total_sales = sum(
            (item["total_sales"] for item in prev_team_results), Decimal(0)
        )
        prev_team_sales_count = sum(item["sales_count"] for item in prev_team_results)
        prev_team_average_sale = (
            prev_team_total_sales / prev_team_sales_count
            if prev_team_sales_count
            else Decimal(0)
        )

        team_new_customers_count = sum(
            item["new_customers_count"] for item in team_results
        )
        prev_team_new_customers_count = sum(
            item["new_customers_count"] for item in prev_team_results
        )

        sales_by_team.append(TeamSales(team=team, total_sales=team_total_sales))
        bonus_by_team.append(TeamBonus(team=team, total_bonus=team_total_bonus))
        goal_achievement_by_team.append(
            TeamAchievement(team=team, achievement_pct=achievement_pct)
        )
        average_sale_by_team.append(
            TeamAverageSale(
                team=team,
                average_sale=team_average_sale,
                sales_count=team_sales_count,
                average_sale_change_pct=_pct_change(
                    team_average_sale, prev_team_average_sale
                ),
            )
        )
        new_customers_by_team.append(
            TeamNewCustomers(
                team=team,
                new_customers_count=team_new_customers_count,
                new_customers_change_pct=_pct_change(
                    Decimal(team_new_customers_count),
                    Decimal(prev_team_new_customers_count),
                ),
            )
        )

    ranked_results = sorted(
        (
            (
                item,
                _achievement_pct(item["total_sales"], TEAM_MONTHLY_GOALS[item["team"]]),
            )
            for item in results
        ),
        key=lambda pair: pair[1],
        reverse=True,
    )[:5]
    top_performers = [
        TopPerformer(
            salesperson_id=item["salesperson_id"],
            name=(
                f"{salespeople_map[item['salesperson_id']]['first_name']} "
                f"{salespeople_map[item['salesperson_id']]['last_name']}"
            ),
            team=item["team"],
            goal_achievement_pct=goal_achievement_pct,
            total_sales=item["total_sales"],
            bonus=item["bonus"],
        )
        for item, goal_achievement_pct in ranked_results
    ]

    sales_trend = []
    for offset in range(TREND_MONTHS - 1, -1, -1):
        trend_year, trend_month = _shift_month(year, month, -offset)
        if offset == 0:
            trend_results = results
        else:
            trend_results = await _aggregate_sales(trend_year, trend_month)
        trend_total_sales = sum(
            (item["total_sales"] for item in trend_results), Decimal(0)
        )
        label = datetime(trend_year, trend_month, 1, tzinfo=timezone.utc).strftime("%b")
        sales_trend.append(TrendPoint(period=label, total_sales=trend_total_sales))

    return DashboardResponse(
        period=f"{year}-{month:02d}",
        total_sales=total_sales,
        total_sales_change_pct=_pct_change(total_sales, prev_total_sales),
        total_bonus=total_bonus,
        total_bonus_change_pct=_pct_change(total_bonus, prev_total_bonus),
        sales_count=sales_count,
        sales_count_change_pct=_pct_change(
            Decimal(sales_count), Decimal(prev_sales_count)
        ),
        salespeople_count=salespeople_count,
        goal_achievers_count=goal_achievers_count,
        sales_by_team=sales_by_team,
        bonus_by_team=bonus_by_team,
        goal_achievement_by_team=goal_achievement_by_team,
        average_sale_by_team=average_sale_by_team,
        new_customers_by_team=new_customers_by_team,
        top_performers=top_performers,
        sales_trend=sales_trend,
    )
