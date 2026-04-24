from typing import Any, Dict, Optional

class AppException(Exception):
    """Base class for application exceptions."""
    def __init__(
        self, 
        message: str, 
        status_code: int = 500, 
        error_code: Optional[str] = None,
        details: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or self.__class__.__name__
        self.details = details
        super().__init__(self.message)

class NotFoundException(AppException):
    """Raised when a resource is not found."""
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(message, status_code=404, details=details)

class ValidationException(AppException):
    """Raised when validation fails."""
    def __init__(self, message: str = "Validation error", details: Optional[Any] = None):
        super().__init__(message, status_code=400, details=details)

class UnauthorizedException(AppException):
    """Raised when authentication fails."""
    def __init__(self, message: str = "Not authenticated", details: Optional[Any] = None):
        super().__init__(message, status_code=401, details=details)

class ForbiddenException(AppException):
    """Raised when a user is not allowed to perform an action."""
    def __init__(self, message: str = "Permission denied", details: Optional[Any] = None):
        super().__init__(message, status_code=403, details=details)

class InternalServerException(AppException):
    """Raised for unexpected server errors."""
    def __init__(self, message: str = "An unexpected error occurred", details: Optional[Any] = None):
        super().__init__(message, status_code=500, details=details)
