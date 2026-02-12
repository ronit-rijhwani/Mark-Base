# MARKBASE - AI-Powered Attendance Management System

## 📚 Final Year Engineering Project

**Markbase** is a comprehensive, timetable-driven attendance management system designed for educational institutions. It features AI-powered face recognition for student authentication and implements realistic college workflows.

---

## 🎯 Key Features

### 1. **AI-Powered Face Recognition** ⭐
- Students authenticate using facial recognition (no passwords)
- Face encoding stored as 128-dimensional vectors
- Real-time face matching during attendance
- Admin can optionally use face recognition for extra security

### 2. **Role-Based Access Control**
- **Admin**: System management, user creation, analytics
- **Staff**: Attendance marking, session management
- **Student**: View attendance records (read-only)
- **Parent**: View linked child's attendance (read-only)

### 3. **Timetable-Driven Architecture** 🔄
- Dynamic session-based timetable (NOT hardcoded)
- Each division has independent timetable
- Lab sessions with batch-specific timings
- Automatic session detection based on day/time

### 4. **Intelligent Attendance Logic** ⏰
- **Grace Period**: 15 minutes from session start
  - Within grace period → **PRESENT**
  - After grace period → **LATE**
  - Not marked → **ABSENT** (auto-assigned)
- Staff cannot override automatic status
- Admin can edit on same day only

### 5. **Staff-Controlled Workflow**
- Attendance always initiated by staff
- Students cannot independently mark attendance
- Real-time session status monitoring
- Automatic absent marking on session close

---

## 🛠️ Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI** - Modern REST API framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database
- **face-recognition** - AI face recognition library
- **OpenCV** - Image processing
- **python-jose** - JWT authentication
- **passlib** - Password hashing

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - API communication
- **Chart.js** - Data visualization
- **react-webcam** - Camera access for face capture
- **Vite** - Build tool

---

## 📦 Installation & Setup

### Prerequisites
```bash
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- Webcam (for face recognition)
```

### Backend Setup

1. **Navigate to backend directory**
```bash
cd Markbase/backend
```

2. **Create virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file**
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Initialize database with sample data**
```bash
python seed_data.py
```

6. **Run backend server**
```bash
python run.py
```

Backend will run on: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd Markbase/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## 🔑 Default Login Credentials

After running `seed_data.py`:

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Admin** | `admin` | `admin123` | Full system access |
| **Staff** | `staff1` | `staff123` | Can mark attendance |
| **Staff** | `staff2` | `staff123` | Can mark attendance |
| **Parent** | `parent1` | `parent123` | View child attendance |
| **Student** | N/A | Face Recognition | Register face on first login |

---

## 📖 System Workflow

### 1. Admin Setup (One-time)
```
1. Login as admin
2. Create departments (e.g., Computer Engineering)
3. Create classes (e.g., SE, TE, BE)
4. Create divisions (e.g., A, B, C)
5. Create batches for labs (e.g., 1, 2, 3)
6. Create subjects
7. Create staff accounts
8. Create student accounts
9. Create parent accounts (linked to students)
10. Create timetable sessions
```

### 2. Student First Login (One-time per student)
```
1. Open face recognition login
2. Capture face image via webcam
3. System stores face encoding
4. Student can now login with face
```

### 3. Daily Attendance Workflow

#### Staff Process:
```
1. Staff logs in (username + password)
2. System shows active sessions (based on current day/time)
3. Staff opens attendance session
4. Students come one-by-one
5. Each student shows face to camera
6. System recognizes student (AI)
7. System assigns status (present/late) based on time
8. Staff closes session
9. System auto-marks remaining as absent
```

#### Student Process:
```
1. Login with face recognition
2. View subject-wise attendance
3. View attendance percentage
4. Check late entries
5. View alerts for low attendance
```

#### Parent Process:
```
1. Login with username + password
2. View child's overall statistics
3. View subject-wise attendance
4. View daily attendance log
5. Check late entries and absences
```

---

## 🏗️ Database Schema

### Core Tables
1. **users** - Unified authentication
2. **departments** - Academic departments
3. **classes** - Year levels (FE, SE, TE, BE)
4. **divisions** - Sections within classes
5. **batches** - Lab groups
6. **subjects** - Course subjects
7. **staff** - Faculty profiles
8. **students** - Student profiles
9. **parents** - Parent profiles
10. **timetable_sessions** - Weekly timetable entries
11. **attendance_sessions** - Staff-opened sessions
12. **attendance_records** - Individual student marks

---

## 🤖 AI Features Explanation

### Face Recognition Process

1. **Face Encoding (Registration)**
```python
- Capture image from webcam
- Detect face in image using HOG/CNN
- Generate 128-dimensional encoding vector
- Store encoding in database as JSON
```

2. **Face Verification (Login/Attendance)**
```python
- Capture new image
- Generate encoding for new image
- Compare with stored encodings using Euclidean distance
- Match if distance < tolerance (0.6)
- Return student identity
```

3. **Key AI Components**
- **face_recognition library**: Built on dlib's deep learning
- **Face detection**: Histogram of Oriented Gradients (HOG)
- **Face encoding**: Deep neural network (ResNet-based)
- **Face matching**: Distance-based comparison

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Username/password login
- `POST /api/auth/login/face` - Face recognition login
- `POST /api/auth/register-face/{student_id}` - Register face

### Staff
- `GET /api/staff/active-sessions/{staff_id}` - Get active sessions
- `POST /api/staff/open-session/{timetable_session_id}` - Open attendance
- `POST /api/staff/mark-attendance/{session_id}` - Mark with face
- `POST /api/staff/close-session/{session_id}` - Close session

### Student
- `GET /api/student/my-attendance/{student_id}` - Get attendance
- `GET /api/student/dashboard/{student_id}` - Dashboard data

### Parent
- `GET /api/parent/child-attendance/{parent_id}` - Child attendance
- `GET /api/parent/child-daily-log/{parent_id}` - Daily log

### Admin
- `POST /api/admin/departments` - Create department
- `POST /api/admin/classes` - Create class
- `POST /api/admin/divisions` - Create division
- `POST /api/admin/staff` - Create staff account
- `POST /api/admin/students` - Create student account

Complete API documentation: `http://localhost:8000/docs`

---

## 🎓 Viva Questions & Answers

### 1. Why FastAPI instead of Flask?
**Answer**: FastAPI provides automatic API documentation (Swagger UI), built-in data validation with Pydantic, async support for better performance, and type hints for better code quality. It's modern and production-ready.

### 2. How does face recognition work in your system?
**Answer**: We use the `face-recognition` library which uses deep learning. When a student registers, we capture their face image, detect the face, and generate a 128-dimensional encoding vector using a pre-trained ResNet model. During authentication, we generate an encoding for the new image and compare it with stored encodings using Euclidean distance. If distance is below threshold (0.6), faces match.

### 3. Why is timetable session-based and not hardcoded?
**Answer**: Different divisions have different timings. Lab sessions vary by batch and day. Some divisions have Saturday working, others don't. Hardcoding would fail for this complexity. Session-based approach stores each lecture/lab as independent entry with division, day, time, making it flexible and scalable.

### 4. Explain the grace period logic.
**Answer**: Session starts at, say, 9:00 AM. Grace period is 15 minutes (9:00-9:15). If student marks attendance before 9:15, status = PRESENT. After 9:15 but before session end, status = LATE. Status is assigned automatically based on marking timestamp. Staff cannot override. This ensures fairness and prevents manipulation.

### 5. Why can't staff edit attendance?
**Answer**: To maintain integrity. Status is calculated automatically based on time. Only admin can edit on same day for genuine corrections. This prevents favoritism and ensures accountability.

### 6. How do you ensure students can't mark attendance without staff?
**Answer**: Attendance marking requires an open attendance session. Only staff can open sessions. Students authenticate with face, but the API checks if a session is open. Without staff opening it, marking fails.

### 7. What's the difference between division and batch?
**Answer**: Division is a class section (e.g., SE-A, SE-B) for theory lectures. Batch is a smaller lab group within a division (e.g., SE-A Batch 1) for practical sessions. Theory sessions apply to whole division, lab sessions to specific batches.

### 8. How does admin create timetable?
**Answer**: Admin creates timetable sessions via API. Each session has: division_id, batch_id (for labs), subject_id, staff_id, day_of_week, start_time, end_time, session_type. System then matches current day/time to detect active sessions.

### 9. Why SQLite instead of MySQL/PostgreSQL?
**Answer**: SQLite is file-based, requires no separate server, perfect for academic projects and demos. Easy to set up, portable, sufficient for college-level system. Can upgrade to PostgreSQL for production.

### 10. How is this different from typical attendance systems?
**Answer**: 
- **AI-powered**: Face recognition, not RFID cards
- **Timetable-driven**: Dynamic, not hardcoded
- **Grace period logic**: Automatic status assignment
- **Staff-controlled**: Students can't self-mark
- **Role-based**: Different interfaces for each role

### 11. What happens if face recognition fails?
**Answer**: Staff has manual fallback option (for demo). In production, student can try again with better lighting. Admin can reset face encoding if needed.

### 12. How do you handle multiple students with similar faces?
**Answer**: Face encoding captures unique facial features. The 128-dimensional vector is highly discriminative. We use a tolerance of 0.6 - tight enough to avoid false matches but loose enough for genuine matches with slight variations.

### 13. Can system work offline?
**Answer**: Backend requires server running. Frontend needs backend API. For full offline: can package as desktop app with Electron, embed Python backend. Current design is client-server for scalability.

### 14. How do you scale this for 1000+ students?
**Answer**: 
- Database: Migrate to PostgreSQL with indexing
- Face recognition: Use face encoding comparison with optimized algorithms
- Caching: Redis for session data
- Load balancing: Multiple backend instances
- CDN: For frontend assets

### 15. What security measures are implemented?
**Answer**:
- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Face encoding stored securely
- CORS configuration
- Input validation with Pydantic

---

## 🐛 Troubleshooting

### Face recognition not working
```bash
# Ensure good lighting
# Face should be clearly visible
# Try different angles
# Check webcam permissions
```

### Database errors
```bash
# Delete markbase.db and run seed_data.py again
rm markbase.db
python seed_data.py
```

### Port already in use
```bash
# Backend (change in .env)
PORT=8001

# Frontend (change in vite.config.js)
port: 3001
```

### Module not found errors
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

---

## 📝 Project Structure

```
Markbase/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Configuration, database
│   │   ├── models/       # SQLAlchemy models
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities (face recognition, security)
│   ├── requirements.txt
│   ├── run.py
│   └── seed_data.py
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service
│   │   └── styles/       # CSS files
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql        # Database schema
└── README.md
```

---

## 🎯 Future Enhancements

1. **SMS/Email Notifications** - Alert parents on absence
2. **Biometric Integration** - Fingerprint as backup
3. **Mobile App** - React Native version
4. **Reports Generation** - PDF attendance reports
5. **Analytics Dashboard** - Attendance trends, predictions
6. **Geofencing** - Location-based attendance
7. **QR Code Fallback** - Alternative to face recognition

---

## 👨‍💻 Development Team

- **Project**: Final Year Engineering Project
- **Institution**: [Your College Name]
- **Academic Year**: 2023-2024
- **Technology**: Python, FastAPI, React, AI/ML

---

## 📄 License

This project is developed for educational purposes as part of Final Year Engineering curriculum.

---

## 🙏 Acknowledgments

- Face recognition powered by `face_recognition` library (built on dlib)
- UI inspired by modern dark academic themes
- Architecture follows industry best practices

---

## 📞 Support

For issues or questions:
1. Check API documentation at `/docs`
2. Review viva questions section
3. Check troubleshooting guide

---

**⭐ Remember to highlight AI features during viva/demonstration!**
