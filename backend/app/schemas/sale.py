from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.base import DecimalAsFloat
from app.schemas.salesperson import Team


class Sale(BaseModel):
    salesperson_id: str
    invoice_number: str
    customer_id: str
    amount: DecimalAsFloat = Field(examples=[199.99])
    date: datetime


class SaleUpdate(BaseModel):
    customer_id: str | None = None
    amount: Decimal | None = Field(default=None, examples=[199.99])
    date: datetime | None = None


class SaleResponse(Sale):
    sale_id: str
    salesperson_name: str
    customer_name: str
    team: Team
    created_at: datetime
    updated_at: datetime


class PaginatedSalesResponse(BaseModel):
    items: list[SaleResponse]
    total: int
    page: int
    limit: int
    total_pages: int
