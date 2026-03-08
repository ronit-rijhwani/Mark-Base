"""
Timetable Session Model - CRITICAL for attendance system.
Stores weekly timetable as individual session entries.
NOT hardcoded - dynamic session-based approach.
"""

from sqlalchemy import Column, Integer, String, DateTime, Time, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class SessionType(str, enum.Enum):
    """Session type enumeration."""
    THEORY = "theory"
    LAB = "lab"


class TimetableSession(Base):
    """
    Timetable session model - represents individual lecture/lab slots.
    
    IMPORTANT: This is session-based, not hardcoded.
    Each division/batch has independent sessions with different timings.
    
    Example:
    - Division A: Monday 9:00-10:00, Subject: DSA, Staff: Prof. Smith
    - Division B: Monday 10:00-11:00, Subject: DSA, Staff: Prof. Smith
    - Batch A1 (Lab): Monday 14:00-17:00, Subject: DSA Lab, Staff: Prof. Jones
    
    Attendance is activated by matching:
    - Current day of week
    - Current time (within start_time and end_time)
    - Staff ID
    """
    __tablename__ = "timetable_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    division_id = Column(Integer, ForeignKey("divisions.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=True)  # NULL for theory
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False, index=True)  # 0=Monday, 1=Tuesday, ..., 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    session_type = Column(String(10), nullable=False)  # theory or lab
    room_number = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    division = relationship("Division", back_populates="timetable_sessions")
    batch = relationship("Batch", back_populates="timetable_sessions")
    subject = relationship("Subject", back_populates="timetable_sessions")
    staff = relationship("Staff", back_populates="timetable_sessions")
    attendance_sessions = relationship("AttendanceSession", back_populates="timetable_session")
    
    def __repr__(self):
        return f"<TimetableSession(id={self.id}, day={self.day_of_week}, time={self.start_time}-{self.end_time})>"
