"""
Batch Model - Represents lab batches within divisions.
Example: Batch 1, 2, 3 for practical/lab sessions
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Batch(Base):
    """
    Batch model for lab groups within a division.
    Used for practical/lab session attendance.
    """
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(10), nullable=False)  # 1, 2, 3, etc.
    division_id = Column(Integer, ForeignKey("divisions.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    division = relationship("Division", back_populates="batches")
    students = relationship("Student", back_populates="batch")
    timetable_sessions = relationship("TimetableSession", back_populates="batch")
    
    # Unique constraint: One batch name per division
    __table_args__ = (
        UniqueConstraint('division_id', 'name', name='uq_batch_division_name'),
    )
    
    def __repr__(self):
        return f"<Batch(id={self.id}, name='{self.name}', division_id={self.division_id})>"
