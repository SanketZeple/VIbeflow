from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class WorkLog(Base):
    __tablename__ = "worklogs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hours = Column(Float, nullable=False)
    description = Column(String(500), nullable=True)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="worklogs")
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<WorkLog(id={self.id}, task_id={self.task_id}, hours={self.hours})>"