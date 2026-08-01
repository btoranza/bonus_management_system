from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field

class CustomerStatus(str, Enum):
    NEW = "new"
    EXISTING = "existing"

class Sale(BaseModel):
    salesperson_id: str
    invoice_number: str
    customer_id: str
    customer_name: str
    customer_status: CustomerStatus
    amount: Decimal = Field(examples=[199.99])
    date: datetime


class SaleUpdate(BaseModel):
    customer_id: str | None = None
    customer_name: str | None = None
    customer_status: CustomerStatus | None = None
    amount: Decimal | None = Field(default=None, examples=[199.99])
    date: datetime | None = None


class SaleResponse(Sale):
    sale_id: str
    created_at: datetime
    updated_at: datetime