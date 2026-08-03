from pydantic import BaseModel

from app.schemas.base import DecimalAsFloat
from app.schemas.salesperson import Team


class TopPerformer(BaseModel):
    salesperson_id: str
    name: str
    team: Team
    goal_achievement_pct: DecimalAsFloat
    total_sales: DecimalAsFloat
    bonus: DecimalAsFloat


class TeamSales(BaseModel):
    team: Team
    total_sales: DecimalAsFloat


class TeamBonus(BaseModel):
    team: Team
    total_bonus: DecimalAsFloat


class TeamAchievement(BaseModel):
    team: Team
    achievement_pct: DecimalAsFloat


class TrendPoint(BaseModel):
    period: str
    total_sales: DecimalAsFloat


class TeamAverageSale(BaseModel):
    team: Team
    average_sale: DecimalAsFloat
    sales_count: int
    average_sale_change_pct: DecimalAsFloat | None


class TeamNewCustomers(BaseModel):
    team: Team
    new_customers_count: int
    new_customers_change_pct: DecimalAsFloat | None


class DashboardResponse(BaseModel):
    period: str
    total_sales: DecimalAsFloat
    total_sales_change_pct: DecimalAsFloat | None
    total_bonus: DecimalAsFloat
    total_bonus_change_pct: DecimalAsFloat | None
    sales_count: int
    sales_count_change_pct: DecimalAsFloat | None
    salespeople_count: int
    goal_achievers_count: int
    sales_by_team: list[TeamSales]
    bonus_by_team: list[TeamBonus]
    goal_achievement_by_team: list[TeamAchievement]
    average_sale_by_team: list[TeamAverageSale]
    new_customers_by_team: list[TeamNewCustomers]
    top_performers: list[TopPerformer]
    sales_trend: list[TrendPoint]
