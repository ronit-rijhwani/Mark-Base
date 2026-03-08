"""
Attendance service - Core business logic for attendance management.
Implements grace period logic and automatic status assignment.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict
from datetime import datetime, date, time
from app.models import (
    AttendanceSession, AttendanceRecord, TimetableSession,
    Student, Staff, Division, Batch
)
from app.utils.time_utils import (
    calculate_attendance_status,
    get_current_date,
    get_current_datetime,
    is_same_day
)


class AttendanceService:
    """
    Service for managing attendance sessions and records.
    
    Key Features:
    - Staff-initiated attendance sessions
    - Automatic grace period logic (15 minutes)
    - Auto-absent marking for unmarked students
    - Admin override capabilities
    """
    
    @staticmethod
    def open_attendance_session(
        db: Session,
        timetable_session_id: int,
        staff_id: int
    ) -> Optional[AttendanceSession]:
        """
        Open an attendance session for a timetable session.
        
        Args:
            db: Database session
            timetable_session_id: Timetable session ID
            staff_id: Staff ID opening the session
        
        Returns:
            Created attendance session or None if already exists
        """
        # Check if session already exists for today
        today = get_current_date()
        existing = db.query(AttendanceSession).filter(
            AttendanceSession.timetable_session_id == timetable_session_id,
            AttendanceSession.date == today
        ).first()
        
        if existing:
            return None  # Session already opened
        
        # Get timetable session details
        timetable_session = db.query(TimetableSession).filter(
            TimetableSession.id == timetable_session_id
        ).first()
        
        if not timetable_session:
            return None
        
        # Create attendance session
        attendance_session = AttendanceSession(
            timetable_session_id=timetable_session_id,
            staff_id=staff_id,
            date=today,
            session_start_time=timetable_session.start_time,
            session_end_time=timetable_session.end_time,
            opened_at=get_current_datetime(),
            status="open"
        )
        
        db.add(attendance_session)
        db.commit()
        db.refresh(attendance_session)
        
        return attendance_session
    
    @staticmethod
    def mark_student_attendance(
        db: Session,
        attendance_session_id: int,
        student_id: int,
        staff_id: int
    ) -> Optional[AttendanceRecord]:
        """
        Mark attendance for a student (with automatic status assignment).
        
        Grace Period Logic:
        - Marked within 15 minutes of session start: PRESENT
        - Marked after 15 minutes: LATE
        
        Security:
        - Validates student belongs to the session's division/batch
        
        Args:
            db: Database session
            attendance_session_id: Attendance session ID
            student_id: Student ID
            staff_id: Staff ID marking attendance
        
        Returns:
            Created attendance record or None if error
        """
        # Check if already marked
        existing = db.query(AttendanceRecord).filter(
            AttendanceRecord.attendance_session_id == attendance_session_id,
            AttendanceRecord.student_id == student_id
        ).first()
        
        if existing:
            return None  # Already marked
        
        # Get attendance session
        attendance_session = db.query(AttendanceSession).filter(
            AttendanceSession.id == attendance_session_id
        ).first()
        
        if not attendance_session or attendance_session.status != "open":
            return None
        
        # Get student
        student = db.query(Student).filter(Student.id == student_id).first()
        
        if not student:
            print(f"❌ Student {student_id} not found")
            return None
        
        # SECURITY CHECK: Verify student belongs to this session
        timetable_session = attendance_session.timetable_session
        
        # Get the staff who opened this session
        staff = db.query(Staff).filter(Staff.id == staff_id).first()
        
        # If staff is a class teacher (has class_id and division_id assigned)
        # Only allow students from that specific class and division
        if staff and staff.class_id and staff.division_id:
            # Get student's class through division
            student_division = db.query(Division).filter(Division.id == student.division_id).first()
            if not student_division:
                print(f"❌ Student {student_id} division not found")
                return None
            
            # Check if student belongs to teacher's assigned class and division
            if student_division.class_id != staff.class_id or student.division_id != staff.division_id:
                print(f"❌ Student {student_id} (Class {student_division.class_id}, Division {student.division_id}) not in teacher's assigned class/division (Class {staff.class_id}, Division {staff.division_id})")
                return None
        else:
            # For non-class teachers, just check division match
            if student.division_id != timetable_session.division_id:
                print(f"❌ Student {student_id} (Division {student.division_id}) not allowed in Division {timetable_session.division_id} session")
                return None
        
        # Calculate status based on marking time (GRACE PERIOD LOGIC)
        marked_at = get_current_datetime()
        status = calculate_attendance_status(
            attendance_session.session_start_time,
            marked_at
        )
        
        # Create attendance record
        record = AttendanceRecord(
            attendance_session_id=attendance_session_id,
            student_id=student_id,
            marked_at=marked_at,
            status=status,
            marked_by=staff_id
        )
        
        db.add(record)
        db.commit()
        db.refresh(record)
        
        print(f"✓ Attendance marked: Student {student_id}, Status: {status.upper()}")
        
        return record
    
    @staticmethod
    def close_attendance_session(
        db: Session,
        attendance_session_id: int,
        staff_id: int
    ) -> bool:
        """
        Close attendance session and mark remaining students as absent.
        
        Args:
            db: Database session
            attendance_session_id: Attendance session ID
            staff_id: Staff ID closing the session
        
        Returns:
            bool: True if successfully closed
        """
        # Get attendance session
        attendance_session = db.query(AttendanceSession).filter(
            AttendanceSession.id == attendance_session_id
        ).first()
        
        if not attendance_session or attendance_session.status != "open":
            return False
        
        # Get timetable session to find all students
        timetable_session = attendance_session.timetable_session
        
        # Get the staff who is closing this session
        staff = db.query(Staff).filter(Staff.id == staff_id).first()
        
        # If staff is a class teacher, only get students from their assigned class and division
        if staff and staff.class_id and staff.division_id:
            students = db.query(Student).join(Division).filter(
                Division.class_id == staff.class_id,
                Student.division_id == staff.division_id
            ).all()
        else:
            # For non-class teachers, get all division students
            students = db.query(Student).filter(
                Student.division_id == timetable_session.division_id
            ).all()
        
        # Get already marked student IDs
        marked_records = db.query(AttendanceRecord).filter(
            AttendanceRecord.attendance_session_id == attendance_session_id
        ).all()
        marked_student_ids = {record.student_id for record in marked_records}
        
        # Mark remaining students as absent
        absent_count = 0
        for student in students:
            if student.id not in marked_student_ids:
                absent_record = AttendanceRecord(
                    attendance_session_id=attendance_session_id,
                    student_id=student.id,
                    marked_at=get_current_datetime(),
                    status="absent",
                    marked_by=staff_id
                )
                db.add(absent_record)
                absent_count += 1
        
        # Close the session
        attendance_session.status = "closed"
        attendance_session.closed_at = get_current_datetime()
        
        db.commit()
        
        print(f"✓ Session closed. {absent_count} students marked as absent.")
        
        return True
    
    @staticmethod
    def get_student_attendance_by_subject(
        db: Session,
        student_id: int,
        subject_id: int
    ) -> List[AttendanceRecord]:
        """
        Get attendance records for a student in a specific subject.
        
        Args:
            db: Database session
            student_id: Student ID
            subject_id: Subject ID
        
        Returns:
            List of attendance records
        """
        records = db.query(AttendanceRecord).join(
            AttendanceSession
        ).join(
            TimetableSession
        ).filter(
            AttendanceRecord.student_id == student_id,
            TimetableSession.subject_id == subject_id
        ).order_by(AttendanceSession.date.desc()).all()
        
        return records
    
    @staticmethod
    def get_student_attendance_percentage(
        db: Session,
        student_id: int,
        subject_id: Optional[int] = None
    ) -> Dict[str, float]:
        """
        Calculate attendance percentage for a student.
        
        Args:
            db: Database session
            student_id: Student ID
            subject_id: Optional subject ID filter
        
        Returns:
            Dict with attendance statistics
        """
        query = db.query(AttendanceRecord).join(
            AttendanceSession
        ).join(
            TimetableSession
        ).filter(
            AttendanceRecord.student_id == student_id
        )
        
        if subject_id:
            query = query.filter(TimetableSession.subject_id == subject_id)
        
        records = query.all()
        
        if not records:
            return {
                "total": 0,
                "present": 0,
                "late": 0,
                "absent": 0,
                "percentage": 0.0
            }
        
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        late = sum(1 for r in records if r.status == "late")
        absent = sum(1 for r in records if r.status == "absent")
        
        # Calculate percentage (present + late considered as attended)
        percentage = ((present + late) / total * 100) if total > 0 else 0.0
        
        return {
            "total": total,
            "present": present,
            "late": late,
            "absent": absent,
            "percentage": round(percentage, 2)
        }
    
    @staticmethod
    def admin_edit_attendance(
        db: Session,
        record_id: int,
        new_status: str,
        admin_id: int
    ) -> bool:
        """
        Admin override to edit attendance record (same day only).
        
        Args:
            db: Database session
            record_id: Attendance record ID
            new_status: New status ('present', 'late', 'absent')
            admin_id: Admin user ID
        
        Returns:
            bool: True if successfully edited
        """
        record = db.query(AttendanceRecord).join(
            AttendanceSession
        ).filter(
            AttendanceRecord.id == record_id
        ).first()
        
        if not record:
            return False
        
        # Check if same day
        if not is_same_day(record.attendance_session.date, get_current_date()):
            return False  # Cannot edit past records
        
        # Update status
        record.status = new_status
        record.edited_by = admin_id
        record.edited_at = get_current_datetime()
        
        db.commit()
        
        return True
    
    @staticmethod
    def get_daily_attendance_report(
        db: Session,
        division_id: int,
        report_date: date
    ) -> List[Dict]:
        """
        Get daily attendance report for a division.
        
        Args:
            db: Database session
            division_id: Division ID
            report_date: Date for report
        
        Returns:
            List of attendance data
        """
        sessions = db.query(AttendanceSession).join(
            TimetableSession
        ).filter(
            TimetableSession.division_id == division_id,
            AttendanceSession.date == report_date
        ).all()
        
        report = []
        for session in sessions:
            records = session.attendance_records
            
            total = len(records)
            present = sum(1 for r in records if r.status == "present")
            late = sum(1 for r in records if r.status == "late")
            absent = sum(1 for r in records if r.status == "absent")
            
            report.append({
                "session_id": session.id,
                "subject": session.timetable_session.subject.name,
                "time": f"{session.session_start_time} - {session.session_end_time}",
                "total": total,
                "present": present,
                "late": late,
                "absent": absent
            })
        
        return report
