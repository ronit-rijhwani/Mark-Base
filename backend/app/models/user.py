"""
User Model - Unified authentication for all roles.
Supports both password-based and face recognition authentication.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    STAFF = "staff"
    STUDENT = "student"
    PARENT = "parent"


class User(Base):
    """
    Unified user table for all system roles.
    
    Authentication methods:
    - Admin: Username + Password + Face Recognition (optional)
    - Staff: Username + Password
    - Student: Face Recognition only
    - Parent: Username + Password
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # NULL for students
    role = Column(String(20), nullable=False)  # admin, staff, student, parent
    face_encoding = Column(String, nullable=True)  # JSON array of face encoding
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships (one-to-one with specific role tables)
    staff = relationship("Staff", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    parent = relationship("Parent", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
