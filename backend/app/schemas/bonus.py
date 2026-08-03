from decimal import Decimal

from pydantic import BaseModel

from app.schemas.salesperson import Team


class BonusComponent(BaseModel):
    type: str
    amount: Decimal


class BonusResponse(BaseModel):
    salesperson_id: str
    period: str
    total_sold: Decimal
    components: list[BonusComponent]
    total_bonus: Decimal


class BonusListItem(BaseModel):
    salesperson_id: str
    salesperson_name: str
    team: Team
    total_sold: Decimal
    base_bonus: Decimal
    new_customer_bonus: Decimal
    total_bonus: Decimal


class PaginatedBonusesResponse(BaseModel):
    items: list[BonusListItem]
    total: int
    page: int
    limit: int
    total_pages: int
