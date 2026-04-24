from fastapi import Request, FastAPI, HTTPException
from fastapi.responses import JSONResponse
from app.core.exceptions import AppException
import logging

logger = logging.getLogger(__name__)

def add_exception_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "code": exc.error_code,
                "message": exc.message,
                "detail": exc.message,  # Compatibility with original detail field
                "details": exc.details,
            },
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "code": "HTTPException",
                "message": str(exc.detail),
                "detail": exc.detail,
                "details": None,
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "code": "InternalServerException",
                "message": "An unexpected error occurred. Please contact support if the issue persists.",
                "detail": "An unexpected error occurred.",
                "details": None,
            },
        )
