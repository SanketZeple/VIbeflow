from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import func
from datetime import datetime
from app.models.column import Column
from app.models.task import Task
from app.models.assignment_history import AssignmentHistory
from app.models.user import User
from app.models.worklog import WorkLog
from app.schemas.board import BoardResponse, BoardColumn, TaskInDB, TaskCreate, TaskTimeReport, TimeReportResponse
from app.core.exceptions import NotFoundException, ValidationException


class BoardService:
    @staticmethod
    def get_board(db: Session) -> BoardResponse:
        """Fetch the entire board with columns and tasks."""
        columns = db.query(Column).order_by(Column.order).all()
        column_ids = [col.id for col in columns]
        
        # Fetch tasks for these columns, ordered by position
        tasks = db.query(Task).filter(Task.column_id.in_(column_ids)).order_by(Task.position).all()
        
        # Group tasks by column_id
        tasks_by_column = {}
        for task in tasks:
            tasks_by_column.setdefault(task.column_id, []).append(task)
        
        # Build column responses
        column_responses = []
        for column in columns:
            column_tasks = tasks_by_column.get(column.id, [])
            column_responses.append(
                BoardColumn(
                    id=column.id,
                    name=column.name,
                    order=column.order,
                    tasks=[TaskInDB.model_validate(task) for task in column_tasks]
                )
            )
        
        return BoardResponse(columns=column_responses)

    @staticmethod
    def create_task(db: Session, title: str, created_by: int, priority: str = "Medium", due_date: Optional[datetime] = None) -> Task:
        """Create a new task in the Backlog column with atomic position."""

        # Get Backlog column
        backlog_column = db.query(Column).filter(Column.name == "Backlog").first()
        if not backlog_column:
            raise NotFoundException("Backlog column not found. System configuration error.")

        # Compute next position (max + 1) atomically within transaction
        max_position = db.query(func.max(Task.position)).filter(Task.column_id == backlog_column.id).scalar()
        next_position = (max_position or -1) + 1

        task = Task(
            title=title,
            column_id=backlog_column.id,
            position=next_position,
            assignee_id=None,
            priority=priority,
            due_date=due_date,
            created_by=created_by,

        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task(
        db: Session,
        task_id: int,
        user_id: int,
        **kwargs
    ) -> Task:
        """Update a task with column, position, assignee changes.
        
        Handles position recomputation when column or position changes.
        Logs assignment history when assignee changes.
        """
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise NotFoundException(f"Task with ID {task_id} not found")


        old_assignee_id = task.assignee_id
        old_column_id = task.column_id
        old_position = task.position

        # Update assignee if provided (including null/unassigned)
        if 'assignee_id' in kwargs:
            new_assignee_id = kwargs['assignee_id']
            if new_assignee_id != old_assignee_id:
                task.assignee_id = new_assignee_id
                # Log assignment history
                history = AssignmentHistory(
                    task_id=task_id,
                    old_assignee_id=old_assignee_id,
                    new_assignee_id=new_assignee_id,
                    changed_by=user_id,
                )
                db.add(history)

        # Update column if provided
        new_column_id = kwargs.get('column_id')
        if new_column_id is not None and new_column_id != old_column_id:
            task.column_id = new_column_id
            # When column changes, we need to recompute positions in both old and new columns
            # For now, we'll set position to the end of the new column (max + 1)
            max_pos = db.query(func.max(Task.position)).filter(Task.column_id == new_column_id).scalar()
            task.position = (max_pos or -1) + 1
            # Shift positions in old column (fill gap)
            BoardService._shift_positions(db, old_column_id, old_position, -1)
        else:
            # Position change within same column
            new_position = kwargs.get('position')
            if new_position is not None:
                # Ensure position is non-negative
                if new_position < 0:
                    new_position = 0
                
                # If position hasn't changed, we still need to handle reordering
                # when dropping a task onto another task at the same position
                if new_position == old_position:
                    # This is a special case: dropping on another task at same position
                    # We'll treat it as inserting at the same position (which will shift others)
                    pass
                
                # Correct position shifting algorithm:
                # 1. Remove task from old position (shift positions > old_position left by 1)
                BoardService._shift_positions(db, old_column_id, old_position, -1)
                # 2. Adjust new_position because positions after old_position have shifted
                if new_position > old_position:
                    new_position -= 1
                # 3. Insert task at new_position (shift positions >= new_position right by 1)
                BoardService._shift_positions(db, old_column_id, new_position, +1)
                # 4. Set task position
                task.position = new_position

        # Update other fields
        if 'title' in kwargs:
            task.title = kwargs['title']
        if 'due_date' in kwargs:
            task.due_date = kwargs['due_date']
        if 'priority' in kwargs:
            task.priority = kwargs['priority']


        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def _shift_positions(db: Session, column_id: int, from_position: int, direction: int):
        """Shift positions of tasks in a column to make room or fill gap.
        
        direction +1: increment positions >= from_position (make room)
        direction -1: decrement positions > from_position (fill gap)
        """
        if direction == 1:
            db.query(Task).filter(
                Task.column_id == column_id,
                Task.position >= from_position
            ).update({Task.position: Task.position + 1})
        elif direction == -1:
            db.query(Task).filter(
                Task.column_id == column_id,
                Task.position > from_position
            ).update({Task.position: Task.position - 1})
        db.flush()

    @staticmethod
    def get_users(db: Session) -> List[User]:
        """Get all users for assignee dropdown."""
        return db.query(User).order_by(User.email).all()

    @staticmethod
    def get_assignment_history(db: Session, task_id: int) -> List[AssignmentHistory]:
        """Get assignment history for a specific task with user names."""
        history = db.query(AssignmentHistory).filter(
            AssignmentHistory.task_id == task_id
        ).order_by(AssignmentHistory.changed_at.desc()).all()
        
        for h in history:
            # Get old assignee name
            if h.old_assignee_id:
                old_user = db.query(User).filter(User.id == h.old_assignee_id).first()
                if old_user:
                    h.old_assignee_name = old_user.full_name or old_user.email.split('@')[0]
            
            # Get new assignee name
            if h.new_assignee_id:
                new_user = db.query(User).filter(User.id == h.new_assignee_id).first()
                if new_user:
                    h.new_assignee_name = new_user.full_name or new_user.email.split('@')[0]
            
            # Get changed by name
            changer = db.query(User).filter(User.id == h.changed_by).first()
            if changer:
                h.changed_by_name = changer.full_name or changer.email.split('@')[0]
                
        return history

    @staticmethod
    def create_worklog(
        db: Session,
        task_id: int,
        user_id: int,
        hours: float,
        description: Optional[str] = None,
    ) -> WorkLog:
        """Create a worklog for a task."""
        # Ensure task exists
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise NotFoundException(f"Task with ID {task_id} not found")
        
        # Validate hours positive
        if hours <= 0:
            raise ValidationException("Logged hours must be a positive number")
        
        worklog = WorkLog(
            task_id=task_id,
            user_id=user_id,
            hours=hours,
            description=description,
        )
        db.add(worklog)
        db.commit()
        db.refresh(worklog)
        return worklog

    @staticmethod
    def get_worklogs(db: Session, task_id: int) -> List[WorkLog]:
        """Get worklogs for a specific task with user details."""
        worklogs = db.query(WorkLog).filter(
            WorkLog.task_id == task_id
        ).order_by(WorkLog.logged_at.desc()).all()
        
        # Attach user details for the schema to pick up
        for wl in worklogs:
            user = db.query(User).filter(User.id == wl.user_id).first()
            if user:
                wl.user_name = user.full_name or user.email.split('@')[0]
                wl.user_email = user.email
        return worklogs

    @staticmethod
    def get_time_report(db: Session) -> TimeReportResponse:
        """Generate time report with total hours per task and grand total."""
        # Query tasks with their column and assignee
        tasks = db.query(Task).join(Column, Task.column_id == Column.id)\
                              .outerjoin(User, Task.assignee_id == User.id)\
                              .outerjoin(WorkLog, Task.id == WorkLog.task_id)\
                              .group_by(Task.id, Column.name, User.email, User.full_name)\
                              .with_entities(
                                  Task.id,
                                  Task.title,
                                  Column.name.label('status'),
                                  User.email.label('assignee_email'),
                                  User.full_name.label('assignee_name'),
                                  Task.priority,
                                  func.coalesce(func.sum(WorkLog.hours), 0).label('total_hours')
                              ).all()

        
        report_tasks = []
        grand_total = 0.0
        for t in tasks:
            report_tasks.append(
                TaskTimeReport(
                    id=t.id,
                    title=t.title,
                    status=t.status,
                    assignee_email=t.assignee_email,
                    assignee_name=t.assignee_name,
                    priority=t.priority,
                    total_hours=t.total_hours

                )
            )
            grand_total += t.total_hours
        
        return TimeReportResponse(tasks=report_tasks, grand_total=grand_total)