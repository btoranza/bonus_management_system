from datetime import datetime

from pydantic import BaseModel


class CustomerCreate(BaseModel):
    customer_name: str


class CustomerResponse(BaseModel):
    customer_id: str
    customer_name: str
    created_at: datetime
    updated_at: datetime


class PaginatedCustomersResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    limit: int
    total_pages: int
