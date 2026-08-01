from fastapi import APIRouter

from app.database.client import db
from app.schemas.dashboard import DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/", response_model=DashboardResponse)
async def get_dashboard_summary(year: int, month: int):
    from app.services.dashboard import get_dashboard_summary as service_get_dashboard_summary
    return await service_get_dashboard_summary(year, month)
