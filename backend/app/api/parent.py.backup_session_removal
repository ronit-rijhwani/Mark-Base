"""
Parent API endpoints for viewing linked student's attendance.
Parents can view attendance data but cannot modify anything.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.attendance_service import AttendanceService
from app.models import Parent, Student, Subject


router = APIRouter(prefix="/api/parent", tags=["Parent"])


@router.get("/child-info/{parent_id}")
def get_child_info(parent_id: int, db: Session = Depends(get_db)):
    """Get information about linked student."""
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    student = parent.student
    
    return {
        "student_id": student.id,
        "name": f"{student.first_name} {student.last_name}",
        "roll_number": student.roll_number,
        "division": student.division.name,
        "batch": student.batch.name if student.batch else None,
        "email": student.email,
        "phone": student.phone
    }


@router.get("/child-attendance/{parent_id}")
def get_child_attendance(parent_id: int, db: Session = Depends(get_db)):
    """
    Get complete attendance data for linked student.
    
    Returns subject-wise attendance with detailed records.
    """
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    student_id = parent.student_id
    student = parent.student
    
    # Get all subjects
    division = student.division
    class_id = division.class_id
    subjects = db.query(Subject).filter(Subject.class_id == class_id).all()
    
    result = []
    for subject in subjects:
        stats = AttendanceService.get_student_attendance_percentage(
            db, student_id, subject.id
        )
        
        result.append({
            "subject_id": subject.id,
            "subject_name": subject.name,
            "total": stats["total"],
            "present": stats["present"],
            "late": stats["late"],
            "absent": stats["absent"],
            "percentage": stats["percentage"]
        })
    
    return result


@router.get("/child-daily-log/{parent_id}")
def get_child_daily_log(parent_id: int, limit: int = 30, db: Session = Depends(get_db)):
    """
    Get daily attendance log for linked student.
    
    Shows recent attendance records with dates and statuses.
    """
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    student_id = parent.student_id
    
    # Get recent attendance records
    from app.models import AttendanceRecord, AttendanceSession
    records = db.query(AttendanceRecord).join(
        AttendanceSession
    ).filter(
        AttendanceRecord.student_id == student_id
    ).order_by(
        AttendanceSession.date.desc()
    ).limit(limit).all()
    
    result = []
    for record in records:
        session = record.attendance_session
        result.append({
            "date": str(session.date),
            "day": session.date.strftime("%A"),
            "subject": session.timetable_session.subject.name,
            "status": record.status.upper(),
            "marked_at": str(record.marked_at.time()),
            "session_time": f"{session.session_start_time} - {session.session_end_time}"
        })
    
    return result


@router.get("/child-late-records/{parent_id}")
def get_child_late_records(parent_id: int, db: Session = Depends(get_db)):
    """
    Get all late attendance records for linked student.
    
    Helps parents monitor punctuality.
    """
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    student_id = parent.student_id
    
    # Get late records
    from app.models import AttendanceRecord, AttendanceSession
    late_records = db.query(AttendanceRecord).join(
        AttendanceSession
    ).filter(
        AttendanceRecord.student_id == student_id,
        AttendanceRecord.status == "late"
    ).order_by(
        AttendanceSession.date.desc()
    ).all()
    
    result = []
    for record in late_records:
        session = record.attendance_session
        result.append({
            "date": str(session.date),
            "subject": session.timetable_session.subject.name,
            "marked_at": str(record.marked_at.time()),
            "grace_period_end": str(session.session_start_time),
            "delay_minutes": (record.marked_at.time().hour * 60 + record.marked_at.time().minute) - 
                           (session.session_start_time.hour * 60 + session.session_start_time.minute + 15)
        })
    
    return {
        "total_late_entries": len(late_records),
        "late_records": result
    }


@router.get("/child-absent-records/{parent_id}")
def get_child_absent_records(parent_id: int, db: Session = Depends(get_db)):
    """
    Get all absent records for linked student.
    """
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    student_id = parent.student_id
    
    # Get absent records
    from app.models import AttendanceRecord, AttendanceSession
    absent_records = db.query(AttendanceRecord).join(
        AttendanceSession
    ).filter(
        AttendanceRecord.student_id == student_id,
        AttendanceRecord.status == "absent"
    ).order_by(
        AttendanceSession.date.desc()
    ).all()
    
    result = []
    for record in absent_records:
        session = record.attendance_session
        result.append({
            "date": str(session.date),
            "day": session.date.strftime("%A"),
            "subject": session.timetable_session.subject.name,
            "session_time": f"{session.session_start_time} - {session.session_end_time}"
        })
    
    return {
        "total_absences": len(absent_records),
        "absent_records": result
    }


@router.get("/dashboard/{parent_id}")
def get_parent_dashboard(parent_id: int, db: Session = Depends(get_db)):
    """
    Get parent dashboard with child's attendance overview.
    """
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    student = parent.student
    student_id = student.id
    
    # Overall stats
    overall_stats = AttendanceService.get_student_attendance_percentage(db, student_id)
    
    # Recent attendance
    from app.models import AttendanceRecord, AttendanceSession
    recent_records = db.query(AttendanceRecord).join(
        AttendanceSession
    ).filter(
        AttendanceRecord.student_id == student_id
    ).order_by(
        AttendanceSession.date.desc()
    ).limit(7).all()
    
    # Count late and absent
    late_count = sum(1 for r in recent_records if r.status == "late")
    absent_count = sum(1 for r in recent_records if r.status == "absent")
    
    return {
        "child_info": {
            "name": f"{student.first_name} {student.last_name}",
            "roll_number": student.roll_number,
            "division": student.division.name
        },
        "overall_statistics": overall_stats,
        "recent_late_count": late_count,
        "recent_absent_count": absent_count,
        "last_7_days_attendance": [
            {
                "date": str(r.attendance_session.date),
                "status": r.status.upper()
            }
            for r in recent_records
        ]
    }
