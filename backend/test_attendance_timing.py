from datetime import time, datetime, date
import unittest
from fastapi import HTTPException
import sys
import os

# Add the backend directory to path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock functions to simulate the attendance_daywise.py logic
def determine_status(check_time_str):
    check_time = datetime.strptime(check_time_str, "%H:%M:%S").time()
    
    grace_start = time(9, 0)
    grace_end = time(18, 0, 59)
    late_cutoff = time(18, 30, 59)
    
    if check_time < grace_start:
        raise HTTPException(status_code=400, detail="Attendance window opens at 09:00 AM")
        
    if check_time <= grace_end:
        return "present"
    elif check_time <= late_cutoff:
        return "absent"
    else:
        return "absent"

class TestAttendanceTiming(unittest.TestCase):

    def test_before_window(self):
        with self.assertRaises(HTTPException) as context:
            determine_status("08:59:59")
        self.assertEqual(context.exception.status_code, 400)
    
    def test_present_window(self):
        # Edge cases and mid window
        self.assertEqual(determine_status("09:00:00"), "present")
        self.assertEqual(determine_status("12:05:00"), "present")
        self.assertEqual(determine_status("18:00:59"), "present")
        
    def test_late_window(self):
        # The 'late' window is now marked as absent
        self.assertEqual(determine_status("18:01:00"), "absent")
        self.assertEqual(determine_status("18:15:00"), "absent")
        self.assertEqual(determine_status("18:30:59"), "absent")
        
    def test_absent_window(self):
        # After cutoff
        self.assertEqual(determine_status("18:31:00"), "absent")
        self.assertEqual(determine_status("23:59:59"), "absent")

if __name__ == '__main__':
    unittest.main()
