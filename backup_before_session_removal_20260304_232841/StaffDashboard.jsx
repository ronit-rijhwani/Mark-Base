/**
 * Staff Dashboard - Day-wise Attendance Management
 * Features:
 * - Turn On/Off attendance for assigned division
 * - Mark attendance with face recognition
 * - Manual attendance marking
 * - View real-time attendance statistics
 * - Grace period: 9:15 AM - 9:30 AM
 */

import React, { useState, useEffect, useRef } from 'react'
import Webcam from 'react-webcam'
import { staffAPI, daywiseAttendanceAPI, adminAPI } from '../services/api'
import '../styles/dashboard.css'

function StaffDashboard({ user, onLogout }) {
  const [division, setDivision] = useState(null)
  const [students, setStudents] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [isAttendanceActive, setIsAttendanceActive] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0, unmarked: 0 })
  const webcamRef = useRef(null)

  // For division selector (when staff has no pre-assigned division)
  const [showDivisionSelector, setShowDivisionSelector] = useState(false)
  const [allClasses, setAllClasses] = useState([])
  const [allDivisions, setAllDivisions] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedDivisionId, setSelectedDivisionId] = useState('')

  useEffect(() => {
    loadStaffDivision()
  }, [])

  useEffect(() => {
    if (division) {
      loadStudents()
      loadTodayAttendance()
    }
  }, [division, selectedDate])

  useEffect(() => {
    if (showDivisionSelector) {
      loadAllClasses()
    }
  }, [showDivisionSelector])

  useEffect(() => {
    if (selectedClassId) {
      loadDivisionsForClass(selectedClassId)
    } else {
      setAllDivisions([])
      setSelectedDivisionId('')
    }
  }, [selectedClassId])

  const loadStaffDivision = async () => {
    try {
      const staffData = await staffAPI.getStaffById(user.staff_id)
      if (staffData.division_id) {
        setDivision({
          id: staffData.division_id,
          name: staffData.division_name,
          class_name: staffData.class_name
        })
      } else {
        // No pre-assigned division — show selector
        setShowDivisionSelector(true)
      }
    } catch (err) {
      console.error('Failed to load staff division:', err)
      setMessage({ type: 'error', text: 'Failed to load staff details. Please try again.' })
      setShowDivisionSelector(true)
    } finally {
      setLoading(false)
    }
  }

  const loadAllClasses = async () => {
    try {
      const data = await adminAPI.getClasses()
      // Remove duplicates based on class ID
      const uniqueClasses = data.filter((cls, index, self) =>
        index === self.findIndex((c) => c.id === cls.id)
      )
      setAllClasses(uniqueClasses)
    } catch (err) {
      console.error('Failed to load classes:', err)
      setMessage({ type: 'error', text: 'Failed to load classes.' })
    }
  }

  const loadDivisionsForClass = async (classId) => {
    try {
      const data = await adminAPI.getDivisions(classId)
      setAllDivisions(data)
      setSelectedDivisionId('')
    } catch (err) {
      console.error('Failed to load divisions:', err)
      setMessage({ type: 'error', text: 'Failed to load divisions.' })
    }
  }

  const handleDivisionSelect = () => {
    if (!selectedClassId || !selectedDivisionId) {
      setMessage({ type: 'error', text: 'Please select both a class and division.' })
      return
    }
    const cls = allClasses.find(c => c.id === parseInt(selectedClassId))
    const div = allDivisions.find(d => d.id === parseInt(selectedDivisionId))
    if (cls && div) {
      setDivision({
        id: div.id,
        name: div.name,
        class_name: cls.name
      })
      setShowDivisionSelector(false)
      setMessage({ type: '', text: '' })
    }
  }

  const loadStudents = async () => {
    try {
      const data = await staffAPI.getStudentsByDivision(division.id)
      setStudents(data)
    } catch (err) {
      console.error('Failed to load students:', err)
    }
  }

  const loadTodayAttendance = async () => {
    try {
      const data = await daywiseAttendanceAPI.getDivisionAttendance(division.id, selectedDate)
      setAttendanceRecords(data.records || [])
      calculateStats(data.records || [])
    } catch (err) {
      console.error('Failed to load attendance:', err)
      setAttendanceRecords([])
      calculateStats([])
    }
  }

  const calculateStats = (records) => {
    const stats = {
      present: records.filter(r => r.status === 'present').length,
      late: records.filter(r => r.status === 'late').length,
      absent: records.filter(r => r.status === 'absent').length,
      unmarked: records.filter(r => r.status === 'unmarked').length
    }
    setStats(stats)
  }

  const handleToggleAttendance = () => {
    setIsAttendanceActive(!isAttendanceActive)
    if (!isAttendanceActive) {
      setMessage({ type: 'success', text: 'Attendance is now active. Students can mark their attendance.' })
      setShowCamera(true)
    } else {
      setMessage({ type: 'info', text: 'Attendance has been turned off.' })
      setShowCamera(false)
    }
  }

  const handleMarkAttendanceWithFace = async () => {
    if (!webcamRef.current) return

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      const blob = await fetch(imageSrc).then(r => r.blob())
      const file = new File([blob], 'attendance.jpg', { type: 'image/jpeg' })

      const result = await daywiseAttendanceAPI.markAttendanceWithFace(user.staff_id, file)
      
      setMessage({ type: 'success', text: `Attendance marked for ${result.student_name}` })
      loadTodayAttendance()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to mark attendance' })
    }
  }

  const handleManualMark = async (studentId, status) => {
    try {
      const currentTime = new Date().toTimeString().split(' ')[0]
      
      await daywiseAttendanceAPI.markAttendance({
        student_id: studentId,
        check_in_time: currentTime,
        marked_by: user.staff_id,
        method: 'manual'
      })
      
      setMessage({ type: 'success', text: 'Attendance marked successfully' })
      loadTodayAttendance()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to mark attendance' })
    }
  }

  const handleBulkMark = async (presentStudentIds) => {
    try {
      await daywiseAttendanceAPI.bulkMarkAttendance({
        division_id: division.id,
        date: selectedDate,
        marked_by: user.staff_id,
        present_student_ids: presentStudentIds
      })
      
      setMessage({ type: 'success', text: 'Bulk attendance marked successfully' })
      loadTodayAttendance()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to mark bulk attendance' })
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  // Show division selector if staff has no pre-assigned division
  if (showDivisionSelector) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Staff Dashboard</h1>
            <p className="welcome-text">Welcome, {user.name}</p>
          </div>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        </div>

        <div className="dashboard-content">
          {message.text && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="dashboard-card" style={{ maxWidth: '500px', margin: '40px auto' }}>
            <h2>Select Class &amp; Division</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Please select the class and division you want to manage attendance for.
            </p>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Class</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="">-- Select Class --</option>
                {allClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Division</label>
              <select
                value={selectedDivisionId}
                onChange={e => setSelectedDivisionId(e.target.value)}
                disabled={!selectedClassId || allDivisions.length === 0}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="">-- Select Division --</option>
                {allDivisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDivisionSelect}
              className="btn btn-success"
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            >
              Proceed to Attendance
            </button>
          </div>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  // Attendance time window: 9:00 AM - 9:45 AM
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTotalMinutes = currentHour * 60 + currentMinute
  const windowStart = 9 * 60        // 9:00 AM
  const windowEnd = 9 * 60 + 45     // 9:45 AM
  const isWithinAttendanceWindow = currentTotalMinutes >= windowStart && currentTotalMinutes <= windowEnd
  const isBeforeWindow = currentTotalMinutes < windowStart
  const isAfterWindow = currentTotalMinutes > windowEnd

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p className="welcome-text">Welcome, {user.name}</p>
          <p className="class-info">Class: {division.class_name} - Division {division.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => { setDivision(null); setShowDivisionSelector(true); setStudents([]); setAttendanceRecords([]); }}
            className="btn btn-secondary"
            style={{ fontSize: '13px' }}
          >
            Change Division
          </button>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Attendance Control */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Attendance Control</h2>
            <div className="date-selector">
              <label>Date: </label>
              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {isToday && (
            <div className="attendance-toggle">
              {isWithinAttendanceWindow ? (
                <>
                  <button
                    onClick={handleToggleAttendance}
                    className={`btn btn-lg ${isAttendanceActive ? 'btn-danger' : 'btn-success'}`}
                  >
                    {isAttendanceActive ? '?? Turn Off Attendance' : '?? Turn On Attendance'}
                  </button>
                  {isAttendanceActive && (
                    <p className="attendance-status">
                      ? Attendance is active. Grace period: 9:15 AM - 9:30 AM
                    </p>
                  )}
                </>
              ) : isBeforeWindow ? (
                <p style={{ color: '#888', fontStyle: 'italic', margin: '10px 0' }}>
                  ? Attendance window opens at 9:00 AM.
                </p>
              ) : (
                <p style={{ color: '#e53935', fontWeight: '600', margin: '10px 0' }}>
                  ?? Attendance window has closed (cutoff: 9:45 AM). You can still view records below.
                </p>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <h3>Total Students</h3>
              <p className="stat-number">{students.length}</p>
            </div>
            <div className="stat-card stat-present">
              <h3>Present</h3>
              <p className="stat-number">{stats.present}</p>
            </div>
            <div className="stat-card stat-late">
              <h3>Late</h3>
              <p className="stat-number">{stats.late}</p>
            </div>
            <div className="stat-card stat-absent">
              <h3>Absent</h3>
              <p className="stat-number">{stats.absent}</p>
            </div>
            <div className="stat-card stat-unmarked">
              <h3>Unmarked</h3>
              <p className="stat-number">{stats.unmarked}</p>
            </div>
          </div>
        </div>

        {/* Face Recognition Camera */}
        {isAttendanceActive && (
          <div className="dashboard-card">
            <h2>Face Recognition</h2>
            <div className="camera-section">
              <button
                onClick={() => setShowCamera(!showCamera)}
                className="btn btn-primary"
              >
                {showCamera ? '?? Hide Camera' : '?? Show Camera'}
              </button>

              {showCamera && (
                <div className="camera-container">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={640}
                    height={480}
                  />
                  <button 
                    onClick={handleMarkAttendanceWithFace} 
                    className="btn btn-success btn-lg"
                  >
                    ?? Capture &amp; Mark Attendance
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student List */}
        <div className="dashboard-card full-width">
          <h2>Student Attendance - {selectedDate}</h2>
          
          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Check-in Time</th>
                  {isToday && isAttendanceActive && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No students found in this division.</td></tr>
                ) : (
                  students.map(student => {
                    const record = attendanceRecords.find(r => r.student_id === student.id)
                    const status = record?.status || 'unmarked'
                    const checkInTime = record?.check_in_time || '-'

                    return (
                      <tr key={student.id}>
                        <td>{student.roll_number}</td>
                        <td>{student.first_name} {student.last_name}</td>
                        <td>
                          <span className={`badge badge-${status}`}>
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td>{checkInTime}</td>
                        {isToday && isAttendanceActive && (
                          <td>
                            {status === 'unmarked' && (
                              <button
                                onClick={() => handleManualMark(student.id)}
                                className="btn btn-sm btn-primary"
                              >
                                Mark Present
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard


