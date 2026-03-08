# DATABASE MIGRATION REQUIRED

After removing session-based models, you need to drop the old tables and recreate:

## Option 1: Drop all tables and recreate (DEVELOPMENT ONLY)
```python
# In Python console or migration script
from app.core.database import engine, Base
from app.models import *

# Drop all tables
Base.metadata.drop_all(bind=engine)

# Recreate all tables
Base.metadata.create_all(bind=engine)
```

## Option 2: Manual SQL (if you need to preserve some data)
```sql
-- Drop session-based tables
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS attendance_sessions;
DROP TABLE IF EXISTS timetable_sessions;

-- Keep these tables (day-wise attendance):
-- daily_attendance
-- grace_periods
-- leave_requests
-- All other tables (students, staff, divisions, etc.)
```

## Tables Removed:
- timetable_sessions
- attendance_sessions  
- attendance_records

## Tables Kept:
- daily_attendance
- grace_periods
- leave_requests
- All master tables (students, staff, divisions, classes, etc.)
