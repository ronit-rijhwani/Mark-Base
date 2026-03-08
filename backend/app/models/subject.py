"""
Subject Model - Represents academic subjects/courses.
Example: Data Structures, Database Management, etc.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Subject(Base):
    """
    Subject model representing courses taught in each class.
    Created by Admin for each class.
    """
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    class_ = relationship("Class", back_populates="subjects")
    
    def __repr__(self):
        return f"<Subject(id={self.id}, name='{self.name}', code='{self.code}')>"

