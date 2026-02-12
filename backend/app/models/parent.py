"""
Parent Model - Represents parent/guardian accounts.
Linked to student for viewing attendance.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class RelationType(str, enum.Enum):
    """Parent relation types."""
    FATHER = "father"
    MOTHER = "mother"
    GUARDIAN = "guardian"


class Parent(Base):
    """
    Parent model for viewing student attendance.
    Created by Admin and linked to specific student.
    Authentication: Username + Password
    """
    __tablename__ = "parents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(15), nullable=False)
    relation = Column(String(20), nullable=True)  # father, mother, guardian
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="parent")
    student = relationship("Student", back_populates="parents")
    
    def __repr__(self):
        return f"<Parent(id={self.id}, name='{self.first_name} {self.last_name}', student_id={self.student_id})>"
