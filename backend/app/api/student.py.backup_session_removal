"""
Student API endpoints for viewing attendance records.
Students can only view their own attendance data (no marking capability).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.core.database import get_db
from app.services.attendance_service import AttendanceService
from app.models import Student, Subject


router = APIRouter(prefix="/api/student", tags=["Student"])


# Response Models
class AttendanceRecordResponse(BaseModel):
    date: str
    subject: str
    status: str
    marked_at: str
    session_time: str


class SubjectAttendanceResponse(BaseModel):
    subject_id: int
    subject_name: str
    total: int
    present: int
    late: int
    absent: int
    percentage: float


@router.get("/my-attendance/{student_id}", response_model=List[SubjectAttendanceResponse])
def get_my_attendance(student_id: int, db: Session = Depends(get_db)):
    """
    Get attendance summary for all subjects.
    
    Returns subject-wise attendance with percentages.
    """
    # Get student
    student = db.query(Student).filter(Student.id == student_id).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get all subjects for student's class
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


@router.get("/attendance/subject/{student_id}/{subject_id}")
def get_attendance_by_subject(
    student_id: int,
    subject_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed attendance records for a specific subject.
    
    Shows date-wise attendance with status (Present/Late/Absent).
    """
    records = AttendanceService.get_student_attendance_by_subject(
        db, student_id, subject_id
    )
    
    result = []
    for record in records:
        session = record.attendance_session
        result.append({
            "date": str(session.date),
            "subject": session.timetable_session.subject.name,
            "status": record.status.upper(),
            "marked_at": str(record.marked_at),
            "session_time": f"{session.session_start_time} - {session.session_end_time}"
        })
    
    return result


@router.get("/attendance/overall/{student_id}")
def get_overall_attendance(student_id: int, db: Session = Depends(get_db)):
    """
    Get overall attendance statistics across all subjects.
    """
    stats = AttendanceService.get_student_attendance_percentage(db, student_id)
    
    return {
        "student_id": student_id,
        "overall_statistics": stats
    }


@router.get("/dashboard/{student_id}")
def get_student_dashboard(student_id: int, db: Session = Depends(get_db)):
    """
    Get student dashboard data with recent attendance and alerts.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Overall stats
    overall_stats = AttendanceService.get_student_attendance_percentage(db, student_id)
    
    # Recent attendance (last 10 records)
    from app.models import AttendanceRecord, AttendanceSession
    recent_records = db.query(AttendanceRecord).join(
        AttendanceSession
    ).filter(
        AttendanceRecord.student_id == student_id
    ).order_by(
        AttendanceSession.date.desc()
    ).limit(10).all()
    
    recent_attendance = [
        {
            "date": str(record.attendance_session.date),
            "subject": record.attendance_session.timetable_session.subject.name,
            "status": record.status.upper(),
            "marked_at": str(record.marked_at)
        }
        for record in recent_records
    ]
    
    # Late entries count
    late_count = sum(1 for r in recent_records if r.status == "late")
    
    # Low attendance subjects (below 75%)
    division = student.division
    class_id = division.class_id
    subjects = db.query(Subject).filter(Subject.class_id == class_id).all()
    
    low_attendance_subjects = []
    for subject in subjects:
        stats = AttendanceService.get_student_attendance_percentage(
            db, student_id, subject.id
        )
        if stats["total"] > 0 and stats["percentage"] < 75:
            low_attendance_subjects.append({
                "subject": subject.name,
                "percentage": stats["percentage"]
            })
    
    return {
        "student_info": {
            "name": f"{student.first_name} {student.last_name}",
            "roll_number": student.roll_number,
            "division": student.division.name,
            "batch": student.batch.name if student.batch else None
        },
        "overall_statistics": overall_stats,
        "recent_attendance": recent_attendance,
        "late_entries_count": late_count,
        "low_attendance_alerts": low_attendance_subjects
    }
