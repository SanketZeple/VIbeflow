from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from typing import Optional, List


class ColumnBase(BaseModel):
    name: str
    order: int


class ColumnCreate(ColumnBase):
    pass


class ColumnUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None


class ColumnInDB(ColumnBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    column_id: int
    position: int = 0
    assignee_id: Optional[int] = None
    priority: str = "Medium"
    due_date: Optional[datetime] = None
    created_by: int



class TaskCreateRequest(BaseModel):
    title: str = Field(..., max_length=255)
    priority: Optional[str] = "Medium"
    due_date: Optional[datetime] = None


    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Title cannot be empty or whitespace")
        return stripped


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    column_id: Optional[int] = None
    position: Optional[int] = None
    assignee_id: Optional[int] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None



class TaskInDB(TaskBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TaskTimeReport(BaseModel):
    """Single row in the time report."""
    id: int
    title: str
    status: str  # column name
    assignee_email: Optional[str] = None
    assignee_name: Optional[str] = None
    priority: str = "Medium"
    total_hours: float = 0.0


    model_config = ConfigDict(from_attributes=True)


class TimeReportResponse(BaseModel):
    """Full time report with grand total."""
    tasks: list[TaskTimeReport]
    grand_total: float

    model_config = ConfigDict(from_attributes=True)


class BoardColumn(ColumnInDB):
    tasks: list[TaskInDB] = []


class BoardResponse(BaseModel):
    columns: list[BoardColumn]


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AssignmentHistoryResponse(BaseModel):
    id: int
    task_id: int
    old_assignee_id: Optional[int] = None
    old_assignee_name: Optional[str] = None
    new_assignee_id: Optional[int] = None
    new_assignee_name: Optional[str] = None
    changed_by: int
    changed_by_name: Optional[str] = None
    changed_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WorkLogCreateRequest(BaseModel):
    hours: float = Field(..., gt=0, description="Positive decimal hours")
    description: Optional[str] = Field(None, max_length=500)

    @field_validator("hours")
    @classmethod
    def validate_hours(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Hours must be positive")
        return v


class WorkLogResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    hours: float
    description: Optional[str] = None
    logged_at: datetime
    
    model_config = ConfigDict(from_attributes=True)