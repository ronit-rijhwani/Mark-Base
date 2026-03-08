"""
Staff API endpoints for Day-wise attendance management.
Handles session opening, viewing active sessions, and closing.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

from app.core.database import get_db
from app.models import AttendanceSession, Division, Staff

router = APIRouter(prefix="/api/staff", tags=["Staff"])

class OpenSessionRequest(BaseModel):
    division_id: int

class SessionResponse(BaseModel):
    id: int
    division_id: int
    division_name: str
    class_name: str
    staff_id: int
    staff_name: str
    date: str
    status: str
    opened_at: str
    closed_at: Optional[str] = None

@router.post("/open-session", response_model=SessionResponse)
def open_attendance_session(
    request: OpenSessionRequest,
    staff_id: int,
    db: Session = Depends(get_db)
):
    """
    Open an attendance session for a division today.
    Staff must open the session before students can mark attendance.
    """
    today = date.today()
    
    # Check if a session already exists for this division today
    existing_session = db.query(AttendanceSession).filter(
        AttendanceSession.division_id == request.division_id,
        AttendanceSession.date == today
    ).first()
    
    if existing_session:
        if existing_session.status == 'open':
            # Just return the existing open session instead of throwing an error!
            division = db.query(Division).filter(Division.id == request.division_id).first()
            staff = db.query(Staff).filter(Staff.id == staff_id).first()
            return {
                "id": existing_session.id,
                "division_id": division.id,
                "division_name": division.name,
                "class_name": division.class_.name,
                "staff_id": staff.id,
                "staff_name": f"{staff.first_name} {staff.last_name}",
                "date": str(existing_session.date),
                "status": existing_session.status,
                "opened_at": str(existing_session.opened_at)
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance session for this division was already closed today."
            )
            
    # Check if staff already opened a session for another division today
    staff_other_session = db.query(AttendanceSession).filter(
        AttendanceSession.staff_id == staff_id,
        AttendanceSession.date == today
    ).first()
    
    if staff_other_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already opened an attendance session for another division today."
        )

    # Get division and staff details
    division = db.query(Division).filter(Division.id == request.division_id).first()
    if not division:
        raise HTTPException(status_code=404, detail="Division not found")
        
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    # Create session
    new_session = AttendanceSession(
        division_id=request.division_id,
        staff_id=staff_id,
        date=today,
        status='open'
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return {
        "id": new_session.id,
        "division_id": division.id,
        "division_name": division.name,
        "class_name": division.class_.name,
        "staff_id": staff.id,
        "staff_name": f"{staff.first_name} {staff.last_name}",
        "date": str(new_session.date),
        "status": new_session.status,
        "opened_at": str(new_session.opened_at)
    }

@router.post("/close-session/{session_id}")
def close_attendance_session(
    session_id: int,
    staff_id: int,
    db: Session = Depends(get_db)
):
    """
    Close an active attendance session.
    """
    session = db.query(AttendanceSession).filter(
        AttendanceSession.id == session_id,
        AttendanceSession.staff_id == staff_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or not owned by you")
        
    if session.status == 'closed':
        raise HTTPException(status_code=400, detail="Session is already closed")
        
    session.status = 'closed'
    session.closed_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Attendance session closed successfully"}

@router.get("/active-session/{staff_id}", response_model=Optional[SessionResponse])
def get_active_session(staff_id: int, db: Session = Depends(get_db)):
    """
    Get the currently active attendance session for the staff today.
    """
    today = date.today()
    session = db.query(AttendanceSession).filter(
        AttendanceSession.staff_id == staff_id,
        AttendanceSession.date == today
    ).first()
    
    if not session:
        return None
        
    return {
        "id": session.id,
        "division_id": session.division.id,
        "division_name": session.division.name,
        "class_name": session.division.class_.name,
        "staff_id": session.staff.id,
        "staff_name": f"{session.staff.first_name} {session.staff.last_name}",
        "date": str(session.date),
        "status": session.status,
        "opened_at": str(session.opened_at),
        "closed_at": str(session.closed_at) if session.closed_at else None
    }

@router.get("/division/{division_id}/students")
def get_division_students(division_id: int, db: Session = Depends(get_db)):
    """
    Get all students in a division. Fast API for staff.
    """
    from app.models import Student
    students = db.query(Student).filter(Student.division_id == division_id).all()
    
    result = []
    for s in students:
        result.append({
            "id": s.id,
            "roll_number": s.roll_number,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "name": f"{s.first_name} {s.last_name}"
        })
    return result
