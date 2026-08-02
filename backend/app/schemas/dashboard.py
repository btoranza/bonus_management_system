from decimal import Decimal

from pydantic import BaseModel

from app.schemas.salesperson import Team


class TopSalesperson(BaseModel):
    salesperson_id: str
    name: str
    team: Team
    total_sales: Decimal
    bonus: Decimal


class TeamSales(BaseModel):
    team: Team
    total_sales: Decimal


class TeamBonus(BaseModel):
    team: Team
    total_bonus: Decimal


class TeamAchievement(BaseModel):
    team: Team
    achievement_pct: Decimal


class TrendPoint(BaseModel):
    period: str
    total_sales: Decimal


class DashboardResponse(BaseModel):
    period: str
    total_sales: Decimal
    total_sales_change_pct: Decimal | None
    total_bonus: Decimal
    total_bonus_change_pct: Decimal | None
    sales_count: int
    sales_count_change_pct: Decimal | None
    salespeople_count: int
    new_customers_count: int
    new_customers_change_pct: Decimal | None
    average_sale: Decimal
    average_sale_change_pct: Decimal | None
    goal_achievers_count: int
    sales_by_team: list[TeamSales]
    bonus_by_team: list[TeamBonus]
    goal_achievement_by_team: list[TeamAchievement]
    top_salespeople: list[TopSalesperson]
    sales_trend: list[TrendPoint]