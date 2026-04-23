from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Column(Base):
    __tablename__ = "columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    order = Column(Integer, unique=True, nullable=False)

    tasks = relationship("Task", back_populates="column", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Column(id={self.id}, name={self.name}, order={self.order})>"