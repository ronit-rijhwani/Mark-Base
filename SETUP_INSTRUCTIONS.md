# 🚀 MARKBASE - Quick Setup Guide

## Step-by-Step Installation

### ✅ Prerequisites Check

Make sure you have:
- [ ] Python 3.8 or higher (`python --version`)
- [ ] Node.js 16 or higher (`node --version`)
- [ ] npm (`npm --version`)
- [ ] Webcam (for face recognition demo)
- [ ] Git (for cloning repository)

---

## 🔧 Backend Setup (5 minutes)

### Step 1: Navigate to Backend
```bash
cd Markbase/backend
```

### Step 2: Create Virtual Environment
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- SQLAlchemy (database)
- face-recognition (AI)
- OpenCV (image processing)
- And other dependencies

**Note**: Installing `face-recognition` may take 2-3 minutes as it includes dlib with compiled C++ code.

### Step 4: Create Environment File
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

The default settings are fine for development.

### Step 5: Initialize Database with Sample Data
```bash
python seed_data.py
```

This creates:
- 1 Admin account
- 5 Staff accounts
- 10 Student accounts
- 1 Parent account
- Complete academic structure
- Sample timetable

**Output should show:**
```
✅ DATABASE SEEDING COMPLETED SUCCESSFULLY
```

### Step 6: Start Backend Server
```bash
python run.py
```

**Success indicators:**
- Server running on `http://localhost:8000`
- Message: "✓ Database initialized successfully"
- No error messages

**Test it:**
Open browser and go to `http://localhost:8000` - you should see:
```json
{
  "application": "Markbase",
  "status": "running"
}
```

**Keep this terminal open!**

---

## 🎨 Frontend Setup (3 minutes)

### Step 1: Open New Terminal
Keep backend running. Open a **new terminal window**.

### Step 2: Navigate to Frontend
```bash
cd Markbase/frontend
```

### Step 3: Install Node Dependencies
```bash
npm install
```

This installs React, Chart.js, Axios, and other frontend libraries.

**Note**: This may take 1-2 minutes.

### Step 4: Start Development Server
```bash
npm run dev
```

**Success indicators:**
- Message: "Local: http://localhost:3000"
- Message: "ready in Xms"
- No error messages

**Test it:**
Open browser and go to `http://localhost:3000` - you should see the **Markbase login page**.

---

## 🎯 First Login Test

### Test 1: Admin Login (Password)
1. Keep "Password Login" tab selected
2. Username: `admin`
3. Password: `admin123`
4. Click "Login"
5. ✅ You should see Admin Dashboard

### Test 2: Staff Login (Password)
1. Logout from admin
2. Username: `staff1`
3. Password: `staff123`
4. Click "Login"
5. ✅ You should see Staff Dashboard

### Test 3: Student Login (Face Recognition)
**Note**: For demo purposes without registered faces, you can:

**Option A: Register a face first**
1. Use the API documentation at `http://localhost:8000/docs`
2. Find `/api/auth/register-face/{student_id}` endpoint
3. Upload a photo
4. Then try face login

**Option B: Use manual fallback**
- Staff dashboard has manual marking option for testing

### Test 4: Parent Login
1. Username: `parent1`
2. Password: `parent123`
3. ✅ You should see Parent Dashboard with child's data

---

## 📚 API Documentation

Visit: `http://localhost:8000/docs`

This shows:
- All available endpoints
- Request/response schemas
- Interactive testing interface (Swagger UI)

You can test APIs directly from this page!

---

## 🐛 Troubleshooting

### Problem: "pip: command not found"
**Solution**: Use `pip3` instead of `pip`

### Problem: "face-recognition installation failed"
**Solution**: 
1. Install Visual C++ Build Tools (Windows)
2. Install cmake: `pip install cmake`
3. Then retry: `pip install face-recognition`

### Problem: "Port 8000 already in use"
**Solution**: 
```bash
# Find and kill process (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Find and kill process (Linux/Mac)
lsof -i :8000
kill -9 <PID>
```

Or change port in `.env`:
```
PORT=8001
```

### Problem: "Port 3000 already in use"
**Solution**: 
Change port in `frontend/vite.config.js`:
```javascript
server: {
  port: 3001
}
```

### Problem: "Module not found"
**Solution**: 
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Problem: "CORS error" in browser console
**Solution**: 
1. Make sure backend is running
2. Check API_BASE_URL in `frontend/src/services/api.js`
3. Should be `http://localhost:8000`

### Problem: "Database is locked"
**Solution**: 
```bash
# Close all connections and restart
# Delete database and reseed
rm markbase.db
python seed_data.py
```

### Problem: Webcam not working
**Solution**:
1. Allow browser camera permissions
2. Check if other apps are using camera
3. Try different browser (Chrome recommended)

---

## 🎬 Demo Preparation Checklist

Before presenting:

### Backend
- [ ] Virtual environment activated
- [ ] Backend server running (`python run.py`)
- [ ] No errors in console
- [ ] API docs accessible at `/docs`

### Frontend
- [ ] Frontend server running (`npm run dev`)
- [ ] Login page loads
- [ ] No console errors (F12 → Console)

### Test Accounts
- [ ] Admin login works
- [ ] Staff login works
- [ ] Parent login works
- [ ] At least one student face registered

### Webcam
- [ ] Camera working
- [ ] Good lighting
- [ ] Browser has camera permission

### Presentation
- [ ] README.md opened
- [ ] VIVA_GUIDE.md opened
- [ ] Code editor ready (VS Code)
- [ ] Both terminals visible

---

## 📊 What to Show During Demo

### 1. Start with Architecture (30 seconds)
- Show folder structure
- Mention tech stack
- Highlight AI component

### 2. Backend First (2 minutes)
- Show running backend
- Open API docs (`/docs`)
- Explain one endpoint (e.g., mark attendance)
- Mention automatic validation

### 3. Database (1 minute)
- Show `seed_data.py` script
- Mention schema in `database/schema.sql`
- Explain relationships

### 4. Frontend Tour (3 minutes)
- **Login Page**: Show both tabs (password & face)
- **Staff Dashboard**: 
  - Open session
  - **Mark attendance with face** (KEY DEMO)
  - Show live status updates
  - Close session
- **Student Dashboard**: Show charts and attendance
- **Parent Dashboard**: Show child tracking

### 5. Code Walkthrough (2 minutes)
- Show face recognition code (`utils/face_recognition.py`)
- Explain encoding generation
- Show attendance logic (`services/attendance_service.py`)
- Highlight grace period calculation

### 6. Emphasize Features (1 minute)
- ✅ AI-powered (face recognition)
- ✅ Timetable-driven (not hardcoded)
- ✅ Automatic grace period logic
- ✅ Role-based access control
- ✅ RESTful API architecture

---

## 🎓 Quick Commands Reference

### Backend Commands
```bash
# Activate virtual environment (do this first!)
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Reset database
python seed_data.py

# Start server
python run.py

# Run with debug
python run.py
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Useful URLs
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Alternative API Docs: `http://localhost:8000/redoc`

---

## ✨ Success Indicators

You'll know everything is working when:

1. ✅ Backend shows: "✓ Application started successfully"
2. ✅ Frontend loads login page with tabs
3. ✅ Admin login successful
4. ✅ Staff can see active sessions
5. ✅ Face recognition captures and processes
6. ✅ Attendance marking shows success message
7. ✅ Student dashboard shows data
8. ✅ Parent dashboard shows child data
9. ✅ API docs load at `/docs`
10. ✅ No console errors

---

## 🆘 Emergency Fixes

### Nuclear Option (If nothing works)
```bash
# Backend
cd backend
rm -rf venv
rm markbase.db
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python seed_data.py
python run.py

# Frontend (new terminal)
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Quick Reset (If database is corrupted)
```bash
cd backend
rm markbase.db
python seed_data.py
```

---

## 📞 Need Help?

1. Check error message carefully
2. Look in Troubleshooting section above
3. Check README.md for detailed info
4. Check VIVA_GUIDE.md for technical answers
5. Google the specific error message

---

## 🎉 Ready to Present!

Once both servers are running and login works, you're ready!

**Pro Tips:**
- Keep both terminals visible during demo
- Have VIVA_GUIDE.md open for reference
- Practice face recognition demo (most impressive part)
- Speak confidently about AI integration
- Mention scalability and security features

**Good luck! 🚀**
