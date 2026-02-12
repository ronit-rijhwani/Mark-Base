"""
Seed script to initialize departments with standard structure
This script will:
1. Clear existing departments, classes, and divisions
2. Create 3 main departments: CO, AO, ME
3. For each department, create classes 1K-6K
4. For each class, create divisions A and B
"""

from app.core.database import engine, SessionLocal
from app.models import Department, Class, Division, Student, Staff
from sqlalchemy.orm import Session

def clear_all_academic_data():
    """Clear all academic structure data"""
    db = SessionLocal()
    try:
        # Delete in order to respect foreign keys
        print("🗑️  Clearing existing data...")
        db.query(Division).delete()
        db.query(Class).delete()
        db.query(Department).delete()
        db.commit()
        print("✅ All existing departments, classes, and divisions cleared")
    except Exception as e:
        db.rollback()
        print(f"❌ Error clearing data: {e}")
    finally:
        db.close()


def seed_departments():
    """Create the 3 main departments"""
    db = SessionLocal()
    try:
        departments_data = [
            {"name": "Computer Engineering", "code": "CO"},
            {"name": "Automation Robotics", "code": "AO"},
            {"name": "Mechanical Engineering", "code": "ME"}
        ]
        
        print("\n📚 Creating departments...")
        departments = []
        for dept_data in departments_data:
            dept = Department(**dept_data)
            db.add(dept)
            departments.append(dept)
            print(f"  ✅ {dept_data['name']} ({dept_data['code']})")
        
        db.commit()
        
        # Refresh to get IDs
        for dept in departments:
            db.refresh(dept)
        
        return departments
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating departments: {e}")
        raise
    finally:
        db.close()


def seed_classes_and_divisions(departments):
    """Create classes 1K-6K and divisions A, B for each department"""
    db = SessionLocal()
    try:
        class_names = ["1K", "2K", "3K", "4K", "5K", "6K"]
        division_names = ["A", "B"]
        
        print("\n📖 Creating classes and divisions...")
        
        for dept in departments:
            # Refresh department to ensure it's attached to session
            dept = db.query(Department).filter(Department.id == dept.id).first()
            
            print(f"\n  Department: {dept.name} ({dept.code})")
            
            for class_name in class_names:
                # Create class
                cls = Class(name=class_name, department_id=dept.id)
                db.add(cls)
                db.flush()  # Get the ID immediately
                
                print(f"    ✅ Class: {class_name}")
                
                # Create divisions for this class
                for div_name in division_names:
                    div = Division(name=div_name, class_id=cls.id)
                    db.add(div)
                    print(f"      ✅ Division: {div_name}")
        
        db.commit()
        print("\n✅ All classes and divisions created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating classes/divisions: {e}")
        raise
    finally:
        db.close()


def verify_seeded_data():
    """Verify the seeded data"""
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("📊 VERIFICATION REPORT")
        print("="*60)
        
        departments = db.query(Department).all()
        print(f"\n✅ Total Departments: {len(departments)}")
        
        for dept in departments:
            classes = db.query(Class).filter(Class.department_id == dept.id).all()
            print(f"\n  📚 {dept.name} ({dept.code})")
            print(f"     Classes: {len(classes)}")
            
            for cls in classes:
                divisions = db.query(Division).filter(Division.class_id == cls.id).all()
                div_names = [d.name for d in divisions]
                print(f"       {cls.name}: Divisions {', '.join(div_names)}")
        
        # Summary
        total_classes = db.query(Class).count()
        total_divisions = db.query(Division).count()
        
        print(f"\n{'='*60}")
        print(f"📊 SUMMARY:")
        print(f"   Departments: {len(departments)}")
        print(f"   Classes: {total_classes}")
        print(f"   Divisions: {total_divisions}")
        print(f"{'='*60}\n")
        
    finally:
        db.close()


if __name__ == "__main__":
    print("╔" + "="*58 + "╗")
    print("║" + " "*15 + "MARKBASE DEPARTMENT SEEDER" + " "*16 + "║")
    print("╚" + "="*58 + "╝\n")
    
    response = input("⚠️  This will DELETE all departments, classes, and divisions. Continue? (yes/no): ")
    
    if response.lower() != "yes":
        print("❌ Aborted.")
        exit()
    
    print("\n🚀 Starting seed process...\n")
    
    # Step 1: Clear existing data
    clear_all_academic_data()
    
    # Step 2: Create departments
    departments = seed_departments()
    
    # Step 3: Create classes and divisions
    seed_classes_and_divisions(departments)
    
    # Step 4: Verify
    verify_seeded_data()
    
    print("✅ Seeding completed successfully!")
    print("\n📝 Next steps:")
    print("   1. Restart backend server")
    print("   2. Refresh frontend (Ctrl + F5)")
    print("   3. You should see CO, AO, ME departments with 1K-6K classes")
