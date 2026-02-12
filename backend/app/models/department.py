"""
Department Model - Represents academic departments.
Example: Computer Engineering, Information Technology, etc.
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Department(Base):
    """
    Department model for organizing academic structure.
    Created and managed by Admin.
    """
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    classes = relationship("Class", back_populates="department", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="department")
    
    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}', code='{self.code}')>"
