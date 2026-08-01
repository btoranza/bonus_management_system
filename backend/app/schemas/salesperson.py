from datetime import date
from enum import Enum

from pydantic import BaseModel, EmailStr


class Team(str, Enum):
    ENTERPRISE = "Enterprise"
    SMB = "SMB"
    MID_MARKET = "Mid-Market"

class Salesperson(BaseModel):
    salesperson_id: str
    first_name: str
    last_name: str
    email: EmailStr
    team: Team
    hire_date: date
    active: bool