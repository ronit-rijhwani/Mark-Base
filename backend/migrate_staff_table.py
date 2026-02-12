"""
Migration script to add class_id and division_id columns to staff table
"""

from app.core.database import engine
from sqlalchemy import text

def migrate_staff_table():
    """Add class_id and division_id columns to staff table if they don't exist"""
    
    with engine.connect() as conn:
        print("🔄 Checking staff table structure...")
        
        # Check if columns exist
        result = conn.execute(text("PRAGMA table_info(staff)"))
        columns = [row[1] for row in result]
        
        needs_migration = False
        
        if 'class_id' not in columns:
            print("  ➕ Adding class_id column...")
            conn.execute(text("ALTER TABLE staff ADD COLUMN class_id INTEGER"))
            needs_migration = True
        else:
            print("  ✓ class_id column already exists")
        
        if 'division_id' not in columns:
            print("  ➕ Adding division_id column...")
            conn.execute(text("ALTER TABLE staff ADD COLUMN division_id INTEGER"))
            needs_migration = True
        else:
            print("  ✓ division_id column already exists")
        
        if needs_migration:
            conn.commit()
            print("✅ Migration completed successfully!")
        else:
            print("✅ No migration needed - staff table is up to date")
        
        # Verify
        result = conn.execute(text("PRAGMA table_info(staff)"))
        print("\n📋 Current staff table structure:")
        for row in result:
            print(f"  - {row[1]} ({row[2]})")

if __name__ == "__main__":
    print("╔" + "="*58 + "╗")
    print("║" + " "*15 + "STAFF TABLE MIGRATION" + " "*22 + "║")
    print("╚" + "="*58 + "╝\n")
    
    migrate_staff_table()
    
    print("\n✅ Migration complete! Restart the backend server.")
