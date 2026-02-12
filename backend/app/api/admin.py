"""
Admin API endpoints for system management.
Handles creation of departments, classes, divisions, users, etc.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from app.core.database import get_db
from app.models import (
    User, Department, Class, Division, Batch, Subject,
    Staff, Student, Parent
)
from app.utils.security import get_password_hash


router = APIRouter(prefix="/api/admin", tags=["Admin"])


# Request Models
class CreateDepartmentRequest(BaseModel):
    name: str
    code: str


class CreateClassRequest(BaseModel):
    name: str
    department_id: int


class CreateDivisionRequest(BaseModel):
    name: str
    class_id: int


class CreateBatchRequest(BaseModel):
    name: str
    division_id: int


class CreateSubjectRequest(BaseModel):
    name: str
    code: str
    class_id: int


class CreateStaffRequest(BaseModel):
    username: str
    password: str
    staff_id: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: int
    class_id: Optional[int] = None
    division_id: Optional[int] = None
    class_id: Optional[int] = None
    division_id: Optional[int] = None
    class_id: Optional[int] = None
    division_id: Optional[int] = None
    class_id: Optional[int] = None
    division_id: Optional[int] = None


class CreateStudentRequest(BaseModel):
    username: str
    roll_number: str
    enrollment_number: Optional[str] = None
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: int  # Added department field
    class_id: int  # Added class field (1K-6K)
    division_id: int  # Division field (A or B)
    batch_id: Optional[int] = None
    date_of_birth: Optional[date] = None
    enrollment_year: Optional[int] = None


class CreateParentRequest(BaseModel):
    username: str
    password: str
    student_id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: str
    relation: str


# Department Endpoints
@router.post("/departments")
def create_department(request: CreateDepartmentRequest, db: Session = Depends(get_db)):
    """Create a new department."""
    # Check if department code already exists
    existing = db.query(Department).filter(Department.code == request.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department code '{request.code}' already exists. Please use a different code."
        )
    
    department = Department(name=request.name, code=request.code)
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    """Get all departments."""
    return db.query(Department).all()


# Class Endpoints
@router.post("/classes")
def create_class(request: CreateClassRequest, db: Session = Depends(get_db)):
    """Create a new class."""
    class_obj = Class(name=request.name, department_id=request.department_id)
    db.add(class_obj)
    db.commit()
    db.refresh(class_obj)
    return class_obj


@router.get("/classes")
def get_classes(department_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all classes, optionally filtered by department."""
    query = db.query(Class)
    if department_id:
        query = query.filter(Class.department_id == department_id)
    return query.all()


# Division Endpoints
@router.post("/divisions")
def create_division(request: CreateDivisionRequest, db: Session = Depends(get_db)):
    """Create a new division."""
    division = Division(name=request.name, class_id=request.class_id)
    db.add(division)
    db.commit()
    db.refresh(division)
    return division


@router.get("/divisions")
def get_divisions(class_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all divisions, optionally filtered by class."""
    query = db.query(Division)
    if class_id:
        query = query.filter(Division.class_id == class_id)
    return query.all()


# Batch Endpoints
@router.post("/batches")
def create_batch(request: CreateBatchRequest, db: Session = Depends(get_db)):
    """Create a new batch."""
    batch = Batch(name=request.name, division_id=request.division_id)
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.get("/batches")
def get_batches(division_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all batches, optionally filtered by division."""
    query = db.query(Batch)
    if division_id:
        query = query.filter(Batch.division_id == division_id)
    return query.all()


# Subject Endpoints
@router.post("/subjects")
def create_subject(request: CreateSubjectRequest, db: Session = Depends(get_db)):
    """Create a new subject."""
    subject = Subject(
        name=request.name,
        code=request.code,
        class_id=request.class_id
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/subjects")
def get_subjects(class_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all subjects, optionally filtered by class."""
    query = db.query(Subject)
    if class_id:
        query = query.filter(Subject.class_id == class_id)
    return query.all()


# Staff Endpoints
@router.post("/staff")
def create_staff(request: CreateStaffRequest, db: Session = Depends(get_db)):
    """Create a new staff member with optional class teacher assignment."""
    # Create user account
    user = User(
        username=request.username,
        password_hash=get_password_hash(request.password),
        role="staff"
    )
    db.add(user)
    db.flush()
    
    # Create staff profile
    staff = Staff(
        user_id=user.id,
        staff_id=request.staff_id,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        phone=request.phone,
        department_id=request.department_id,
        class_id=request.class_id,
        division_id=request.division_id
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    
    return staff


@router.get("/staff")
def get_staff(department_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all staff members."""
    query = db.query(Staff)
    if department_id:
        query = query.filter(Staff.department_id == department_id)
    return query.all()


# Student Endpoints
@router.post("/students")
def create_student(request: CreateStudentRequest, db: Session = Depends(get_db)):
    """Create a new student (face registration happens on first login)."""
    # Validate department, class, and division exist
    department = db.query(Department).filter(Department.id == request.department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    class_obj = db.query(Class).filter(
        Class.id == request.class_id,
        Class.department_id == request.department_id
    ).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found or does not belong to specified department"
        )
    
    division = db.query(Division).filter(
        Division.id == request.division_id,
        Division.class_id == request.class_id
    ).first()
    if not division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Division not found or does not belong to specified class"
        )
    
    # Create user account (no password for students)
    user = User(
        username=request.username,
        password_hash=None,  # Students use face recognition only
        role="student"
    )
    db.add(user)
    db.flush()
    
    # Create student profile
    student = Student(
        user_id=user.id,
        roll_number=request.roll_number,
        enrollment_number=request.enrollment_number,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        phone=request.phone,
        division_id=request.division_id,
        batch_id=request.batch_id,
        date_of_birth=request.date_of_birth,
        enrollment_year=request.enrollment_year,
        face_registered=False
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return student


@router.get("/students")
def get_students(
    division_id: Optional[int] = None,
    batch_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all students."""
    query = db.query(Student)
    if division_id:
        query = query.filter(Student.division_id == division_id)
    if batch_id:
        query = query.filter(Student.batch_id == batch_id)
    return query.all()


# Parent Endpoints
@router.post("/parents")
def create_parent(request: CreateParentRequest, db: Session = Depends(get_db)):
    """Create a new parent account linked to a student."""
    # Create user account
    user = User(
        username=request.username,
        password_hash=get_password_hash(request.password),
        role="parent"
    )
    db.add(user)
    db.flush()
    
    # Create parent profile
    parent = Parent(
        user_id=user.id,
        student_id=request.student_id,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        phone=request.phone,
        relation=request.relation
    )
    db.add(parent)
    db.commit()
    db.refresh(parent)
    
    return parent


@router.get("/parents")
def get_parents(student_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all parents."""
    query = db.query(Parent)
    if student_id:
        query = query.filter(Parent.student_id == student_id)
    return query.all()


# Seed/Initialize Academic Structure
@router.post("/initialize-structure")
def initialize_academic_structure(department_id: int, db: Session = Depends(get_db)):
    """
    Initialize classes (1K-6K) and divisions (A, B) for a department.
    This creates the standard academic structure.
    """
    # Check if department exists
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    created_classes = []
    created_divisions = []
    
    # Create classes 1K-6K
    class_names = ["1K", "2K", "3K", "4K", "5K", "6K"]
    for class_name in class_names:
        # Check if class already exists
        existing_class = db.query(Class).filter(
            Class.name == class_name,
            Class.department_id == department_id
        ).first()
        
        if not existing_class:
            new_class = Class(name=class_name, department_id=department_id)
            db.add(new_class)
            db.flush()
            created_classes.append(new_class)
        else:
            created_classes.append(existing_class)
    
    # Create divisions A and B for each class
    division_names = ["A", "B"]
    for cls in created_classes:
        for div_name in division_names:
            # Check if division already exists
            existing_div = db.query(Division).filter(
                Division.name == div_name,
                Division.class_id == cls.id
            ).first()
            
            if not existing_div:
                new_division = Division(name=div_name, class_id=cls.id)
                db.add(new_division)
                db.flush()
                created_divisions.append(new_division)
            else:
                created_divisions.append(existing_div)
    
    db.commit()
    
    return {
        "message": f"Academic structure initialized for {department.name}",
        "classes_created": len([c for c in created_classes]),
        "divisions_created": len([d for d in created_divisions]),
        "class_names": class_names,
        "division_names": division_names
    }


# Delete Endpoints
@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student account (cascades to user and attendance records)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get student name before deletion
    student_name = f"{student.first_name} {student.last_name}"
    
    # Delete will cascade to user and attendance records due to foreign key constraints
    db.delete(student)
    db.commit()
    
    return {
        "message": f"Student {student_name} deleted successfully",
        "deleted_student_id": student_id
    }


@router.delete("/staff/{staff_id}")
def delete_staff(staff_id: int, db: Session = Depends(get_db)):
    """Delete a staff account (cascades to user)."""
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff not found"
        )
    
    # Get staff name before deletion
    staff_name = f"{staff.first_name} {staff.last_name}"
    
    # Delete will cascade to user
    db.delete(staff)
    db.commit()
    
    return {
        "message": f"Staff {staff_name} deleted successfully",
        "deleted_staff_id": staff_id
    }


@router.delete("/parents/{parent_id}")
def delete_parent(parent_id: int, db: Session = Depends(get_db)):
    """Delete a parent account (cascades to user)."""
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    # Get parent name before deletion
    parent_name = f"{parent.first_name} {parent.last_name}"
    
    # Delete will cascade to user
    db.delete(parent)
    db.commit()
    
    return {
        "message": f"Parent {parent_name} deleted successfully",
        "deleted_parent_id": parent_id
    }


@router.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    """Delete a department (only if no classes/staff are linked to it)."""
    department = db.query(Department).filter(Department.id == department_id).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    # Check if department has classes
    classes_count = db.query(Class).filter(Class.department_id == department_id).count()
    if classes_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete department. It has {classes_count} classes linked to it."
        )
    
    # Check if department has staff
    staff_count = db.query(Staff).filter(Staff.department_id == department_id).count()
    if staff_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete department. It has {staff_count} staff members linked to it."
        )
    
    # Get department name before deletion
    dept_name = f"{department.name} ({department.code})"
    
    db.delete(department)
    db.commit()
    
    return {
        "message": f"Department {dept_name} deleted successfully",
        "deleted_department_id": department_id
    }


@router.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    """Delete a department (only if no classes/staff are linked to it)."""
    department = db.query(Department).filter(Department.id == department_id).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    # Check if department has classes
    classes_count = db.query(Class).filter(Class.department_id == department_id).count()
    if classes_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete department. It has {classes_count} classes linked to it."
        )
    
    # Check if department has staff
    staff_count = db.query(Staff).filter(Staff.department_id == department_id).count()
    if staff_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete department. It has {staff_count} staff members linked to it."
        )
    
    # Get department name before deletion
    dept_name = f"{department.name} ({department.code})"
    
    db.delete(department)
    db.commit()
    
    return {
        "message": f"Department {dept_name} deleted successfully",
        "deleted_department_id": department_id
    }


# Attendance Edit Endpoint
class EditAttendanceRequest(BaseModel):
    status: str  # 'present', 'late', or 'absent'


@router.put("/attendance/{record_id}")
def edit_attendance_status(
    record_id: int,
    request: EditAttendanceRequest,
    admin_id: int,
    db: Session = Depends(get_db)
):
    """
    Edit attendance status for a record.
    
    Admin can change status to: present, late, or absent
    Only allows editing records from today.
    """
    from app.services.attendance_service import AttendanceService
    
    # Validate status
    if request.status not in ['present', 'late', 'absent']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'present', 'late', or 'absent'"
        )
    
    # Use the existing admin_edit_attendance service
    success = AttendanceService.admin_edit_attendance(
        db, record_id, request.status, admin_id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit attendance record. It may not exist or is from a previous day."
        )
    
    return {
        "message": "Attendance status updated successfully",
        "record_id": record_id,
        "new_status": request.status.upper()
    }
