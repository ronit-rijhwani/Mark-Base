# Quick Start Guide - Updated Markbase System

## ✅ What's Fixed

### 1. **Student Creation Form**
- ✅ Now asks for **Department** first
- ✅ Then shows **Class options** (1K, 2K, 3K, 4K, 5K, 6K)
- ✅ Then shows **Division options** (A, B)
- ✅ Dropdowns cascade automatically

### 2. **Staff Creation Form**
- ✅ Already had Department field
- ✅ Now has **"Class Teacher For"** field (optional)
- ✅ Now has **Division** field (optional)
- ✅ When assigned, teacher can only mark attendance for their class/division

### 3. **Academic Structure**
- ✅ Classes and Divisions are no longer empty
- ✅ Initialized with 1K-6K classes
- ✅ Each class has divisions A and B

### 4. **Attendance Security**
- ✅ Class teachers can only see/mark students from their assigned class and division
- ✅ Students from other classes cannot mark attendance in wrong sessions

---

## 🚀 Running the Application

### Backend Server
```powershell
cd Markbase/backend
python run.py
```
Server runs on: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

### Frontend Server
```powershell
cd Markbase/frontend
npm run dev
```
Server runs on: **http://localhost:3000**

---

## 📋 Step-by-Step Usage

### STEP 1: Initialize Academic Structure (First Time Only)

For each department, run this once:

**Computer Engineering (Department ID: 1)**
```
POST http://localhost:8000/api/admin/initialize-structure?department_id=1
```

**Information Technology (Department ID: 2)**
```
POST http://localhost:8000/api/admin/initialize-structure?department_id=2
```

**Automation (Department ID: 3)**
```
POST http://localhost:8000/api/admin/initialize-structure?department_id=3
```

This creates:
- Classes: 1K, 2K, 3K, 4K, 5K, 6K
- Divisions: A and B for each class

---

### STEP 2: Create Students

1. Open **http://localhost:3000**
2. Login as admin
3. Go to **Users → Students → + Add Student**
4. Fill the form:
   - **Department**: Select (e.g., Computer Engineering)
   - **Class**: Select (e.g., 2K) ← Only shows after department selected
   - **Division**: Select (e.g., A) ← Only shows after class selected
   - Fill other details (name, roll number, email, etc.)
   - Optional: Capture face photo
5. Click **Create Student**

---

### STEP 3: Create Staff (Class Teacher)

1. Go to **Users → Staff → + Add Staff**
2. Fill the form:
   - **Department**: Select (e.g., Computer Engineering)
   - **Class Teacher For**: Select class (e.g., 2K) - OPTIONAL
   - **Division**: Select division (e.g., A) - OPTIONAL
   - Fill other details (name, staff ID, email, username, password)
3. Click **Create Staff**

**If you assign class and division:**
- This staff becomes a class teacher for 2K-A
- They can ONLY mark attendance for students in 2K-A
- Students from other classes/divisions cannot mark attendance in their sessions

**If you leave class/division empty:**
- Regular staff member (not a class teacher)
- Can mark attendance for any division they teach

---

### STEP 4: Verify Attendance Flow

1. **Login as Class Teacher** (e.g., teacher assigned to 2K-A)
2. **Open Attendance Session**
3. **Student from 2K-A tries to mark attendance** ✅ Allowed
4. **Student from 3K-B tries to mark attendance** ❌ Rejected with error

---

## 🎯 Current Status

### Backend ✅
- Server running on port 8000
- All API endpoints working
- Database populated with 1K-6K classes
- 14 divisions created (A and B for each class)

### Frontend ✅
- Server running on port 3000
- React app loaded successfully
- Forms updated with cascading dropdowns

---

## 🔍 Verify Everything Works

### Check Classes Created
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/admin/classes?department_id=1" -Method GET
```

Should show: 1K, 2K, 3K, 4K, 5K, 6K (plus any old classes like SE, TE)

### Check Divisions Created
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/admin/divisions" -Method GET
```

Should show: Division A and B for each class

---

## 🐛 Common Issues

### Issue: "Class and Division dropdowns are empty"
**Solution**: Run the initialize-structure endpoint for your department (see STEP 1)

### Issue: "Student creation fails with validation error"
**Solution**: Make sure you selected department, class, AND division

### Issue: "Frontend not loading on localhost:3000"
**Solution**: 
```powershell
cd Markbase/frontend
npm install
npm run dev
```

### Issue: "Backend API not responding"
**Solution**:
```powershell
cd Markbase/backend
python run.py
```

---

## 📝 Important Notes

1. **Department is now required** for student creation
2. **Class and division must match** (division must belong to selected class)
3. **Class teacher assignment is optional** for staff
4. **Old data** (SE, TE classes) will still exist - you can use them or ignore them
5. **1K-6K structure** is the new standard format

---

## 🎓 Example Workflow

**Creating a Student for Computer Engineering, 2nd Year (2K), Division A:**

1. Department: Computer Engineering ✓
2. Class: 2K ✓
3. Division: A ✓
4. Roll Number: 2026001
5. Name: John Doe
6. Email: john@example.com
7. Capture Face → Submit

**Creating a Class Teacher for 2K-A:**

1. Department: Computer Engineering ✓
2. Class Teacher For: 2K ✓
3. Division: A ✓
4. Staff ID: STAFF001
5. Name: Prof. Smith
6. Username: prof.smith
7. Password: secure123

Now Prof. Smith can ONLY mark attendance for students in 2K-A!

---

## ✨ Summary

All requested features have been implemented:
- ✅ Department field in student creation
- ✅ Class selection with 1K-6K options
- ✅ Division selection with A & B options
- ✅ Class teacher assignment for staff
- ✅ Attendance filtering by teacher's assigned class/division
- ✅ Both servers tested and working

**Ready to use! Open http://localhost:3000 and start creating students and staff.**
