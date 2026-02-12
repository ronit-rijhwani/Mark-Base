"""
Main FastAPI application entry point.
Configures CORS, routes, and database initialization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api import auth, admin, staff, student, parent, timetable


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Attendance Management System for Educational Institutions"
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(staff.router)
app.include_router(student.router)
app.include_router(parent.router)
app.include_router(timetable.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    print("=" * 50)
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print("=" * 50)
    init_db()
    print("✓ Application started successfully")


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "Welcome to Markbase - AI-powered Attendance Management System"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
