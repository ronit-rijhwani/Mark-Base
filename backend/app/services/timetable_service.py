"""
Timetable service for managing session-based timetables.
Implements dynamic session detection logic (NOT hardcoded).
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Dict
from datetime import datetime, time
from app.models import TimetableSession, Staff, Division, Batch, Subject
from app.utils.time_utils import (
    get_current_day_of_week,
    get_current_time,
    is_time_in_range
)


class TimetableService:
    """
    Service for timetable management and active session detection.
    
    CRITICAL: Uses dynamic session-based approach, NOT hardcoded timings.
    Each division/batch has independent timetable entries.
    """
    
    @staticmethod
    def get_active_sessions_for_staff(db: Session, staff_id: int) -> List[TimetableSession]:
        """
        Get currently active sessions for a staff member.
        
        Logic:
        - Matches current day of week
        - Matches current time (within session start and end)
        - Matches staff ID
        
        Args:
            db: Database session
            staff_id: Staff ID
        
        Returns:
            List of active timetable sessions
        """
        current_day = get_current_day_of_week()
        current_time = get_current_time()
        
        # Query sessions matching day and staff
        sessions = db.query(TimetableSession).filter(
            TimetableSession.staff_id == staff_id,
            TimetableSession.day_of_week == current_day,
            TimetableSession.is_active == True
        ).all()
        
        # Filter by current time
        active_sessions = []
        for session in sessions:
            if is_time_in_range(current_time, session.start_time, session.end_time):
                active_sessions.append(session)
        
        return active_sessions
    
    @staticmethod
    def get_sessions_for_division(db: Session, division_id: int, day: Optional[int] = None) -> List[TimetableSession]:
        """
        Get timetable sessions for a division.
        
        Args:
            db: Database session
            division_id: Division ID
            day: Optional day filter (0=Monday, 6=Sunday)
        
        Returns:
            List of timetable sessions
        """
        query = db.query(TimetableSession).filter(
            TimetableSession.division_id == division_id,
            TimetableSession.is_active == True
        )
        
        if day is not None:
            query = query.filter(TimetableSession.day_of_week == day)
        
        return query.order_by(TimetableSession.day_of_week, TimetableSession.start_time).all()
    
    @staticmethod
    def get_sessions_for_batch(db: Session, batch_id: int, day: Optional[int] = None) -> List[TimetableSession]:
        """
        Get lab sessions for a batch.
        
        Args:
            db: Database session
            batch_id: Batch ID
            day: Optional day filter
        
        Returns:
            List of lab sessions
        """
        query = db.query(TimetableSession).filter(
            TimetableSession.batch_id == batch_id,
            TimetableSession.session_type == "lab",
            TimetableSession.is_active == True
        )
        
        if day is not None:
            query = query.filter(TimetableSession.day_of_week == day)
        
        return query.order_by(TimetableSession.day_of_week, TimetableSession.start_time).all()
    
    @staticmethod
    def get_weekly_timetable_for_staff(db: Session, staff_id: int) -> Dict[int, List[TimetableSession]]:
        """
        Get complete weekly timetable for a staff member.
        
        Args:
            db: Database session
            staff_id: Staff ID
        
        Returns:
            Dict mapping day_of_week to list of sessions
        """
        sessions = db.query(TimetableSession).filter(
            TimetableSession.staff_id == staff_id,
            TimetableSession.is_active == True
        ).order_by(TimetableSession.day_of_week, TimetableSession.start_time).all()
        
        # Group by day
        weekly_schedule = {}
        for session in sessions:
            if session.day_of_week not in weekly_schedule:
                weekly_schedule[session.day_of_week] = []
            weekly_schedule[session.day_of_week].append(session)
        
        return weekly_schedule
    
    @staticmethod
    def create_timetable_session(
        db: Session,
        division_id: int,
        subject_id: int,
        staff_id: int,
        day_of_week: int,
        start_time: time,
        end_time: time,
        session_type: str,
        batch_id: Optional[int] = None,
        room_number: Optional[str] = None
    ) -> TimetableSession:
        """
        Create a new timetable session.
        
        Args:
            db: Database session
            division_id: Division ID
            subject_id: Subject ID
            staff_id: Staff ID
            day_of_week: Day (0=Monday, 6=Sunday)
            start_time: Session start time
            end_time: Session end time
            session_type: 'theory' or 'lab'
            batch_id: Optional batch ID for lab sessions
            room_number: Optional room number
        
        Returns:
            Created timetable session
        """
        session = TimetableSession(
            division_id=division_id,
            batch_id=batch_id,
            subject_id=subject_id,
            staff_id=staff_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            session_type=session_type,
            room_number=room_number
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return session
    
    @staticmethod
    def check_session_conflict(
        db: Session,
        staff_id: int,
        day_of_week: int,
        start_time: time,
        end_time: time,
        exclude_session_id: Optional[int] = None
    ) -> bool:
        """
        Check if there's a timing conflict for a staff member.
        
        Args:
            db: Database session
            staff_id: Staff ID
            day_of_week: Day to check
            start_time: Session start time
            end_time: Session end time
            exclude_session_id: Optional session ID to exclude from check
        
        Returns:
            bool: True if conflict exists
        """
        query = db.query(TimetableSession).filter(
            TimetableSession.staff_id == staff_id,
            TimetableSession.day_of_week == day_of_week,
            TimetableSession.is_active == True
        )
        
        if exclude_session_id:
            query = query.filter(TimetableSession.id != exclude_session_id)
        
        sessions = query.all()
        
        # Check for time overlap
        for session in sessions:
            # Check if times overlap
            if (start_time < session.end_time and end_time > session.start_time):
                return True
        
        return False
