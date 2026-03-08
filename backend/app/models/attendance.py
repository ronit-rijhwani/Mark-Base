"""
Attendance Models - Day-wise attendance tracking.
Implements 9:15-9:30 grace period logic.
"""

from sqlalchemy import Column, Integer, String, DateTime, Date, Time, ForeignKey, Text, Boolean, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class DailyAttendance(Base):
    __tablename__ = 'daily_attendance'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    division_id = Column(Integer, ForeignKey('divisions.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False)
    check_in_time = Column(Time, nullable=False)
    status = Column(String(10), nullable=False)
    marked_by = Column(Integer, ForeignKey('staff.id', ondelete='SET NULL'))
    marked_method = Column(String(20))
    edited_by = Column(Integer, ForeignKey('staff.id', ondelete='SET NULL'))
    edited_at = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('student_id', 'date', name='uq_student_date'),
        CheckConstraint("status IN ('present', 'late', 'absent')"),
        CheckConstraint("marked_method IN ('face_recognition', 'manual', 'system', 'admin_manual')"),
    )
    
    student = relationship("Student", back_populates="daily_attendance")
    division = relationship("Division", back_populates="daily_attendance")


class GracePeriod(Base):
    __tablename__ = 'grace_periods'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    division_id = Column(Integer, ForeignKey('divisions.id', ondelete='CASCADE'))
    grace_start_time = Column(Time, nullable=False, default='09:15:00')
    grace_end_time = Column(Time, nullable=False, default='09:30:00')
    late_threshold_minutes = Column(Integer, default=15)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    division = relationship("Division", back_populates="grace_periods")


class LeaveRequest(Base):
    __tablename__ = 'leave_requests'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default='pending')
    approved_by = Column(Integer, ForeignKey('staff.id', ondelete='SET NULL'))
    approved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'approved', 'rejected')"),
    )
    
    student = relationship("Student", back_populates="leave_requests")
    approver = relationship("Staff", back_populates="approved_leaves")
