from app.api.auth import router as auth_router
from app.api.board import router as board_router
from app.api.reports import router as reports_router

__all__ = ["auth_router", "board_router", "reports_router"]