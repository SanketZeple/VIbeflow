from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class AssignmentHistory(Base):
    __tablename__ = "assignment_history"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    old_assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    new_assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="assignment_history")
    old_assignee = relationship("User", foreign_keys=[old_assignee_id])
    new_assignee = relationship("User", foreign_keys=[new_assignee_id])
    changer = relationship("User", foreign_keys=[changed_by])

    def __repr__(self):
        return f"<AssignmentHistory(id={self.id}, task_id={self.task_id}, old={self.old_assignee_id}, new={self.new_assignee_id})>"