"""
Time and date utilities for timetable and attendance logic.
Handles grace period calculations and session timing.
"""

from datetime import datetime, time, timedelta, date
from typing import Tuple


def get_current_day_of_week() -> int:
    """
    Get current day of week (0=Monday, 6=Sunday).
    
    Returns:
        int: Day of week index
    """
    return datetime.now().weekday()


def get_current_time() -> time:
    """
    Get current time.
    
    Returns:
        time: Current time object
    """
    return datetime.now().time()


def get_current_date() -> date:
    """
    Get current date.
    
    Returns:
        date: Current date object
    """
    return datetime.now().date()


def is_time_in_range(current_time: time, start_time: time, end_time: time) -> bool:
    """
    Check if current time falls within a time range.
    
    Args:
        current_time: Time to check
        start_time: Range start time
        end_time: Range end time
    
    Returns:
        bool: True if current_time is between start_time and end_time
    """
    return start_time <= current_time <= end_time


def calculate_attendance_status(session_start: time, marked_at: datetime) -> str:
    """
    Calculate attendance status based on marking time (GRACE PERIOD LOGIC).
    
    Rules:
    - From session_start to session_start + 15 minutes: PRESENT
    - After 15 minutes until session end: LATE
    - Not marked: ABSENT (handled separately)
    
    Args:
        session_start: Session start time
        marked_at: Time when attendance was marked
    
    Returns:
        str: 'present' or 'late'
    """
    # Combine session start time with current date
    session_start_datetime = datetime.combine(marked_at.date(), session_start)
    
    # Calculate grace period end (15 minutes after start)
    grace_period_end = session_start_datetime + timedelta(minutes=15)
    
    # Determine status
    if marked_at <= grace_period_end:
        return "present"
    else:
        return "late"


def get_grace_period_end(session_start: time, session_date: date) -> datetime:
    """
    Get the grace period end time for a session.
    
    Args:
        session_start: Session start time
        session_date: Session date
    
    Returns:
        datetime: Grace period end datetime (session_start + 15 minutes)
    """
    session_start_datetime = datetime.combine(session_date, session_start)
    return session_start_datetime + timedelta(minutes=15)


def is_same_day(date1: date, date2: date) -> bool:
    """
    Check if two dates are the same day.
    
    Args:
        date1: First date
        date2: Second date
    
    Returns:
        bool: True if same day
    """
    return date1 == date2


def time_to_string(t: time) -> str:
    """
    Convert time object to string format (HH:MM).
    
    Args:
        t: Time object
    
    Returns:
        str: Time string in HH:MM format
    """
    return t.strftime("%H:%M")


def string_to_time(time_str: str) -> time:
    """
    Convert string to time object.
    
    Args:
        time_str: Time string in HH:MM format
    
    Returns:
        time: Time object
    """
    return datetime.strptime(time_str, "%H:%M").time()


def get_current_datetime() -> datetime:
    """
    Get current datetime.
    
    Returns:
        datetime: Current datetime
    """
    return datetime.now()
