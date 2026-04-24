from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.board import TimeReportResponse
from app.services.board import BoardService
from app.api.dependencies import get_current_user
from app.schemas.user import UserInDB

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/time", response_model=TimeReportResponse)
def get_time_report(
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    """Get time report with total hours per task and grand total."""
    return BoardService.get_time_report(db)