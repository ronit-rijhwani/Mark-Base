"""
Entry point to run the Markbase backend server.
"""

import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print("=" * 60)
    print(f"  MARKBASE - Attendance Management System")
    print(f"  Version: {settings.APP_VERSION}")
    print("=" * 60)
    print(f"\n🚀 Starting server on http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"🔧 Debug Mode: {settings.DEBUG}\n")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
