# Goal Description
The objective is to change the attendance window from **9:15 AM - 9:45 AM** to **10:00 AM - 10:30 AM** for testing purposes. 
The new timeline will be:
- **Grace Period (Present):** 10:00 AM - 10:15 AM
- **Late Window:** 10:15 AM - 10:30 AM
- **Absent / Closed:** After 10:30 AM

## User Review Required
> [!WARNING]
> Since the `grace_periods` settings are stored in the database, updating the Python model defaults won't retroactively apply to existing divisions in your current database. You will explicitly need to run an SQL `UPDATE` statement on your local database to apply this change for your current testing session. This step is included in the Validation Plan below.

## Proposed Changes

### Frontend (UI & Logic)
#### [MODIFY] [StaffDashboard.jsx](file:///d:/FinalYearProject/Mark-Base/frontend/src/pages/StaffDashboard.jsx)
- **Line 309:** Update `const windowStart` from `9 * 60 + 15` (9:15 AM) to `10 * 60 + 0` (10:00 AM).
- **Line 310:** Update `const windowEnd` from `9 * 60 + 45` (9:45 AM) to `10 * 60 + 30` (10:30 AM).
- **Lines 337, 364, 370, 387:** Update UI text notes (e.g. "Note: Session must be turned on by the staff at exactly 10:00 AM. Window closes at 10:30 AM").

---

### Backend (API & Models)
#### [MODIFY] [attendance_daywise.py](file:///d:/FinalYearProject/Mark-Base/backend/app/api/attendance_daywise.py)
- **Lines 55-57:** Update check-in logic:
  - `grace_start = time(10, 0)`
  - `grace_end = time(10, 15)`
  - `late_cutoff = time(10, 30)`
- **Line 60:** Update error message to "Attendance window opens at 10:00 AM".
- **Line 140:** Adjust [BulkMarkRequest](file:///d:/FinalYearProject/Mark-Base/backend/app/api/attendance_daywise.py#25-30) default check-in time to `time(10, 0)`.
- **Line 204:** Update late cutoff check for auto-absent from `time(9, 45)` to `time(10, 30)`.

#### [MODIFY] [attendance.py](file:///d:/FinalYearProject/Mark-Base/backend/app/models/attendance.py)
- **Lines 44-45:** Update [GracePeriod](file:///d:/FinalYearProject/Mark-Base/backend/app/models/attendance.py#39-52) default columns:
  - `grace_start_time` default to `'10:00:00'`
  - `grace_end_time` default to `'10:15:00'`
- **Line 78:** Update Docstring about session auto-closing at 10:30 AM.

#### [MODIFY] [main.py](file:///d:/FinalYearProject/Mark-Base/backend/app/main.py)
- **Lines 40 & 56:** Update terminal startup print statements to say "10:00-10:15 AM".

---

### Database Schema Defaults
#### [MODIFY] [schema_daywise_attendance.sql](file:///d:/FinalYearProject/Mark-Base/database/schema_daywise_attendance.sql)
- **Lines 39-40:** Change defaults for `grace_period_start` to `'10:00:00'` and `grace_period_end` to `'10:15:00'`.
- **Line 100:** Update the manual INSERT statements to use `'10:00:00'` and `'10:15:00'`.
- **Comments:** Update comments across the file to reflect the new 10:00 AM base time.

*(Optional: Setup/Migration scripts like [setup_daywise_attendance.py](file:///d:/FinalYearProject/Mark-Base/backend/setup_daywise_attendance.py) and [migrate_to_daywise.py](file:///d:/FinalYearProject/Mark-Base/backend/migrate_to_daywise.py) also contain references to 9:15, but since they are already executed one-time scripts, updating them is only necessary if you plan to reset the database entirely).*

---

### Tests and Environment Files
- **Unit/Integration Tests:** There are no automated tests ([test_daywise_models.py](file:///d:/FinalYearProject/Mark-Base/backend/test_daywise_models.py)) that strictly assert on the hardcoded 9:15 AM time. The models are simply imported and schema creation is verified.
- **Environment config:** The time is not driven by `.env` variables; it is derived from hardcoded constants and the `grace_periods` database table.

## Verification Plan

### Database Override
Before validating, we must update the current database rows:
```sql
UPDATE grace_periods 
SET grace_start_time='10:00:00', grace_end_time='10:15:00' 
WHERE is_active=1;
```

### Validation Steps
1. **Restart Servers:** Terminate and restart both the FastAPI backend and React frontend.
2. **Observe UI:** Visit the Staff Dashboard; you should see the warnings and notifications reflecting "10:00 AM" instead of "9:15 AM".
3. **Manual Check-In Testing:**
   - Attempt to check-in at 9:55 AM (Device Time) → **Should Fail** ("Attendance window opens at 10:00 AM").
   - Attempt check-in at 10:10 AM → **Should Succeed** (Status: Present).
   - Attempt check-in at 10:20 AM → **Should Succeed** (Status: Late).
   - Attempt check-in at 10:45 AM → **Should Fail** ("Attendance window has closed").

### How to Revert
1. Run a `git checkout` on the modified `frontend/` and `backend/` files to restore the old times.
2. Re-run the database override to set the time back:
```sql
UPDATE grace_periods 
SET grace_start_time='09:15:00', grace_end_time='09:30:00' 
WHERE is_active=1;
```
3. Restart servers.
