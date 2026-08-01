from decimal import Decimal

from pydantic import BaseModel


class BonusComponent(BaseModel):
    type: str
    amount: Decimal


class BonusResponse(BaseModel):
    salesperson_id: str
    period: str
    total_sold: Decimal
    components: list[BonusComponent]
    total_bonus: Decimal
