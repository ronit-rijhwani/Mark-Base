# 🏗️ MARKBASE - System Architecture

## Overview

Markbase follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│              (React Frontend - Port 3000)                │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Login  │  │  Admin   │  │  Staff   │  │  Student │ │
│  │  Page   │  │Dashboard │  │Dashboard │  │Dashboard │ │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                    REST API (HTTP/JSON)
                          │
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                   │
│              (FastAPI Backend - Port 8000)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth Service │  │  Timetable   │  │  Attendance  │  │
│  │ (JWT + Face) │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                    SQLAlchemy ORM
                          │
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│                  (SQLite Database)                       │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────┐   │
│  │ Users  │  │ Staff  │  │Students│  │ Attendance │   │
│  │        │  │        │  │        │  │  Records   │   │
│  └────────┘  └────────┘  └────────┘  └────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend (React)

#### Structure
```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Unified login
│   │   ├── AdminDashboard.jsx
│   │   ├── StaffDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── ParentDashboard.jsx
│   ├── services/
│   │   └── api.js          # API client
│   ├── styles/             # CSS files
│   │   ├── global.css
│   │   ├── login.css
│   │   └── dashboard.css
│   ├── App.jsx             # Router
│   └── main.jsx            # Entry point
```

#### Key Features
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **react-webcam**: Camera access for face capture
- **Chart.js**: Data visualization
- **Role-based routing**: Different dashboards per role

---

### 2. Backend (FastAPI)

#### Structure
```
backend/
├── app/
│   ├── api/                # API endpoints
│   │   ├── auth.py         # Authentication
│   │   ├── admin.py        # Admin operations
│   │   ├── staff.py        # Staff operations
│   │   ├── student.py      # Student operations
│   │   ├── parent.py       # Parent operations
│   │   └── timetable.py    # Timetable management
│   ├── core/               # Core configuration
│   │   ├── config.py       # Settings
│   │   └── database.py     # DB connection
│   ├── models/             # SQLAlchemy models
│   │   ├── user.py
│   │   ├── staff.py
│   │   ├── student.py
│   │   ├── timetable.py
│   │   └── attendance.py
│   ├── services/           # Business logic
│   │   ├── auth_service.py
│   │   ├── timetable_service.py
│   │   └── attendance_service.py
│   └── utils/              # Utilities
│       ├── security.py     # JWT, hashing
│       ├── face_recognition.py  # AI module
│       └── time_utils.py   # Time calculations
```

#### Key Features
- **FastAPI**: Modern async web framework
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation
- **JWT**: Token-based authentication
- **Auto-documentation**: Swagger UI at /docs

---

### 3. Database (SQLite)

#### Schema Overview
```
users (unified auth)
  ├── staff (foreign key)
  ├── students (foreign key)
  └── parents (foreign key)

departments
  └── classes
      ├── divisions
      │   └── batches
      └── subjects

timetable_sessions
  └── attendance_sessions
      └── attendance_records
```

#### Key Tables

**Academic Structure:**
- `departments` → `classes` → `divisions` → `batches`
- `subjects` (linked to classes)

**Users:**
- `users` (unified authentication)
- `staff`, `students`, `parents` (role-specific data)

**Attendance:**
- `timetable_sessions` (weekly schedule)
- `attendance_sessions` (staff-opened)
- `attendance_records` (individual marks)

---

## Data Flow Diagrams

### 1. Student Face Login Flow

```
┌────────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐
│Student │─────>│ React   │─────>│ FastAPI  │─────>│ Face     │
│        │      │ Webcam  │      │ Endpoint │      │Recognition│
│        │      │         │      │          │      │ Service  │
└────────┘      └─────────┘      └──────────┘      └──────────┘
                     │                 │                 │
                     │ Capture Image   │                 │
                     └────────────────>│                 │
                                       │ Process         │
                                       └────────────────>│
                                                         │
                                       ┌─────────────────┘
                                       │ Match Face
                                       │ Return student_id
                     ┌─────────────────┘
                     │ Generate JWT
                     │ Return user data
┌────────┐          │
│Student │<─────────┘
│Dashboard│
└────────┘
```

### 2. Attendance Marking Flow

```
┌──────┐    ┌──────────┐    ┌────────────┐    ┌──────────┐
│Staff │───>│ Open     │───>│ Student    │───>│ Close    │
│Login │    │ Session  │    │ Marks Face │    │ Session  │
└──────┘    └──────────┘    └────────────┘    └──────────┘
   │              │                │                 │
   │ Detect       │ Create         │ Verify          │ Auto-mark
   │ Active       │ Attendance     │ Student         │ Absent
   │ Session      │ Session        │ + Assign        │
   │              │                │ Status          │
   ▼              ▼                ▼                 ▼
Database     Database         Database          Database
```

### 3. Grace Period Logic

```
Session Start: 9:00 AM
     │
     ├─── 9:00 - 9:15 ───> PRESENT ✓
     │    (Grace Period)
     │
     ├─── 9:15 - 10:00 ──> LATE ⚠️
     │    (After Grace)
     │
     └─── Not Marked ────> ABSENT ✗
          (Auto-assigned)
```

---

## API Architecture

### RESTful Endpoints

#### Authentication (`/api/auth`)
- `POST /login` - Password-based login
- `POST /login/face` - Face recognition login
- `POST /register-face/{id}` - Register face

#### Staff Operations (`/api/staff`)
- `GET /active-sessions/{id}` - Get active sessions
- `POST /open-session/{id}` - Open attendance
- `POST /mark-attendance/{id}` - Mark with face
- `POST /close-session/{id}` - Close session

#### Student Operations (`/api/student`)
- `GET /my-attendance/{id}` - Get attendance
- `GET /dashboard/{id}` - Dashboard data

#### Admin Operations (`/api/admin`)
- `POST /departments` - Create department
- `POST /staff` - Create staff account
- `POST /students` - Create student account

### Request/Response Flow

```
Client                 FastAPI              Service           Database
  │                       │                    │                  │
  │  POST /api/staff/    │                    │                  │
  │  mark-attendance     │                    │                  │
  ├──────────────────────>│                    │                  │
  │                       │ Validate Token    │                  │
  │                       │ Extract user_id   │                  │
  │                       ├──────────────────>│                  │
  │                       │                    │ Verify Face     │
  │                       │                    │ Calculate Status│
  │                       │                    ├─────────────────>│
  │                       │                    │                  │
  │                       │                    │<─────────────────┤
  │                       │<──────────────────┤                  │
  │<──────────────────────┤                    │                  │
  │  200 OK + Data        │                    │                  │
```

---

## Security Architecture

### Authentication Flow

```
┌──────────┐
│  Login   │
│ Request  │
└────┬─────┘
     │
     ▼
┌──────────────┐
│  Validate    │
│ Credentials  │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│  Generate    │
│  JWT Token   │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Return Token │
│  to Client   │
└──────────────┘
     │
     ▼
┌──────────────┐
│ Client stores│
│ in localStorage│
└──────────────┘
     │
     ▼
┌──────────────┐
│ Subsequent   │
│ requests     │
│ include token│
└──────────────┘
```

### Security Layers

1. **Authentication**: JWT tokens
2. **Authorization**: Role-based access control
3. **Password Security**: Bcrypt hashing
4. **Input Validation**: Pydantic models
5. **SQL Injection Prevention**: SQLAlchemy ORM
6. **CORS**: Configured origins
7. **Face Data**: Only encodings stored

---

## AI Module Architecture

### Face Recognition Pipeline

```
┌─────────────┐
│ Capture     │
│ Image       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Face        │
│ Detection   │ (HOG/CNN)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Face        │
│ Alignment   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Face        │
│ Encoding    │ (ResNet DNN)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 128-d Vector│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Compare with│
│ Stored      │
│ Encodings   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Euclidean   │
│ Distance    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Match?      │
│ (< 0.6)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Return      │
│ Identity    │
└─────────────┘
```

---

## Deployment Architecture

### Development Setup
```
┌──────────────────┐
│  Developer PC    │
│                  │
│  ┌────────────┐  │
│  │ Frontend   │  │
│  │ :3000      │  │
│  └────────────┘  │
│                  │
│  ┌────────────┐  │
│  │ Backend    │  │
│  │ :8000      │  │
│  └────────────┘  │
│                  │
│  ┌────────────┐  │
│  │ SQLite DB  │  │
│  └────────────┘  │
└──────────────────┘
```

### Production Setup (Future)
```
┌──────────────┐    ┌──────────────┐
│   CDN        │    │ Load Balancer│
│ (Frontend)   │    │              │
└──────────────┘    └──────┬───────┘
                           │
                  ┌────────┴────────┐
                  │                 │
         ┌────────▼────┐   ┌────────▼────┐
         │ API Server 1│   │ API Server 2│
         └────────┬────┘   └────────┬────┘
                  │                 │
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │   PostgreSQL    │
                  │   (Primary)     │
                  └─────────────────┘
```

---

## Performance Considerations

### Optimization Strategies

1. **Database**
   - Indexes on frequently queried columns
   - Foreign key constraints for integrity
   - Connection pooling

2. **API**
   - Async endpoints where applicable
   - Response caching
   - Pagination for large datasets

3. **Face Recognition**
   - Pre-computed encodings
   - Caching of frequently accessed data
   - GPU acceleration (optional)

4. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization

---

## Scalability Path

### Phase 1: Current (< 500 users)
- SQLite database
- Single server
- File-based storage

### Phase 2: Growth (500-5000 users)
- PostgreSQL
- Redis caching
- Separate API servers
- CDN for frontend

### Phase 3: Enterprise (5000+ users)
- Database replication
- Microservices architecture
- Message queue (RabbitMQ/Kafka)
- Kubernetes orchestration
- GPU cluster for face recognition

---

## Technology Justification

| Technology | Why Chosen |
|-----------|------------|
| **FastAPI** | Modern, async, auto-docs, type safety |
| **React** | Component-based, large ecosystem, performance |
| **SQLite** | No setup, portable, sufficient for academic |
| **SQLAlchemy** | ORM abstraction, migration support |
| **face_recognition** | Proven accuracy, easy to use, dlib-based |
| **JWT** | Stateless, scalable, standard |
| **Vite** | Fast build times, modern tooling |

---

## Integration Points

### External APIs (Future)
- SMS Gateway (Twilio) for alerts
- Email Service (SendGrid) for notifications
- Cloud Storage (AWS S3) for face images
- Analytics (Google Analytics) for usage tracking

### Hardware Integration (Future)
- Fingerprint scanners
- RFID readers (backup)
- IP cameras
- Access control systems

---

This architecture is designed to be:
- ✅ **Scalable**: Can grow from prototype to production
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Secure**: Multiple security layers
- ✅ **Extensible**: Easy to add new features
- ✅ **Testable**: Service layer enables unit testing
