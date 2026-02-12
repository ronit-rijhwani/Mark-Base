"""
Class Model - Represents academic years/classes.
Example: FE (First Year), SE (Second Year), TE, BE
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Class(Base):
    """
    Class model representing academic year levels.
    Each class belongs to a department.
    """
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # FE, SE, TE, BE
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="classes")
    divisions = relationship("Division", back_populates="class_", cascade="all, delete-orphan")
    subjects = relationship("Subject", back_populates="class_", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Class(id={self.id}, name='{self.name}', department_id={self.department_id})>"
