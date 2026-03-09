import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'markbase.db')
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Try updating both attendance_config and grace_periods if they exist
try:
    c.execute("UPDATE grace_periods SET grace_start_time='11:00:00', grace_end_time='11:30:00' WHERE is_active=1;")
    print("Updated grace_periods")
except Exception as e:
    print("grace_periods error:", e)

try:
    c.execute("UPDATE attendance_config SET grace_period_start='11:00:00', grace_period_end='11:30:00';")
    print("Updated attendance_config")
except Exception as e:
    print("attendance_config error:", e)

conn.commit()
conn.close()
