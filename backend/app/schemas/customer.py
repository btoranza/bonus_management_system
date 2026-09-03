from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class CustomerStatus(str, Enum):
    NEW = "new"
    EXISTING = "existing"


class CustomerCreate(BaseModel):
    customer_name: str


class CustomerResponse(BaseModel):
    customer_id: str
    customer_name: str
    status: CustomerStatus
    first_sale_date: datetime | None = None
    created_at: datetime
    updated_at: datetime


class PaginatedCustomersResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    limit: int
    total_pages: int
