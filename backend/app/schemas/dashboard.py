from decimal import Decimal

from pydantic import BaseModel


class TopSalesperson(BaseModel):
    salesperson_id: str
    name: str
    total_sales: Decimal
    bonus: Decimal


class DashboardResponse(BaseModel):
    period: str
    total_sales: Decimal
    total_bonus: Decimal
    sales_count: int
    salespeople_count: int
    new_customers_count: int
    goal_achievers_count: int
    top_salesperson: TopSalesperson