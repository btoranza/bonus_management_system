from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class Sale(BaseModel):
    salesperson_id: str
    customer_id: str
    customer_name: str
    amount: Decimal
    date: datetime


class SaleUpdate(BaseModel):
    customer_id: str | None = None
    customer_name: str | None = None
    amount: Decimal | None = None
    date: datetime | None = None


class SaleResponse(Sale):
    id: str
    created_at: datetime
    updated_at: datetime