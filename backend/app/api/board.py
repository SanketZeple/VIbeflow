from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.board import BoardResponse, TaskCreateRequest, TaskInDB, TaskUpdate, UserResponse, AssignmentHistoryResponse, WorkLogCreateRequest, WorkLogResponse
from app.services.board import BoardService
from app.api.dependencies import get_current_user
from app.schemas.user import UserInDB

router = APIRouter(prefix="/board", tags=["board"])


@router.get("/", response_model=BoardResponse)
def get_board(
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    """Get the shared board with all columns and tasks."""
    try:
        board = BoardService.get_board(db)
        return board
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch board")


@router.post("/tasks", response_model=TaskInDB)
def create_task(
    task_data: TaskCreateRequest,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    """Create a new task in the Backlog column."""
    try:
        task = BoardService.create_task(
            db=db,
            title=task_data.title,
            created_by=current_user.id,
            due_date=task_data.due_date,
        )
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create task")


@router.patch("/tasks/{task_id}", response_model=TaskInDB)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    """Update a task's column, position, assignee, etc."""
    try:
        task = BoardService.update_task(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            **task_update.model_dump(exclude_unset=True)
        )
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update task")


@router.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    """Get all users for assignee dropdown."""
    try:
        users = BoardService.get_users(db)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch users")


@router.get("/tasks/{task_id}/assignment-history", response_model=List[AssignmentHistoryResponse])
def get_assignment_history(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    """Get assignment history for a specific task."""
    try:
        history = BoardService.get_assignment_history(db, task_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch assignment history")


@router.post("/tasks/{task_id}/worklogs", response_model=WorkLogResponse)
def create_worklog(
    task_id: int,
    worklog_data: WorkLogCreateRequest,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    """Create a worklog for a task."""
    try:
        worklog = BoardService.create_worklog(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            hours=worklog_data.hours,
            description=worklog_data.description,
        )
        return worklog
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create worklog")


@router.get("/tasks/{task_id}/worklogs", response_model=List[WorkLogResponse])
def get_worklogs(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    """Get worklogs for a specific task."""
    try:
        worklogs = BoardService.get_worklogs(db, task_id)
        return worklogs
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch worklogs")