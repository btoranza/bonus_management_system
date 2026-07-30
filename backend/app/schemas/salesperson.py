from datetime import date
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class Salesperson(BaseModel):
    salesperson_id: str
    first_name: str
    last_name: str
    email: EmailStr
    team: str
    hire_date: date
    commission_rate: Decimal = Field(examples=[0.05])
    active: bool