/**
 * Staff Dashboard - Main interface for faculty members.
 * Features:
 * - View active sessions
 * - Open attendance sessions
 * - Mark student attendance with face recognition
 * - Close sessions
 */

import React, { useState, useEffect, useRef } from 'react'
import Webcam from 'react-webcam'
import { staffAPI } from '../services/api'
import '../styles/dashboard.css'

function StaffDashboard({ user, onLogout }) {
  const [activeSessions, setActiveSessions] = useState([])
  const [openSession, setOpenSession] = useState(null)
  const [sessionStatus, setSessionStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showCamera, setShowCamera] = useState(false)
  const webcamRef = useRef(null)

  useEffect(() => {
    loadActiveSessions()
    // Refresh active sessions every 30 seconds
    const interval = setInterval(loadActiveSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (openSession) {
      loadSessionStatus()
      const interval = setInterval(loadSessionStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [openSession])

  const loadActiveSessions = async () => {
    try {
      const sessions = await staffAPI.getActiveSessions(user.staff_id)
      setActiveSessions(sessions)
    } catch (err) {
      console.error('Failed to load sessions:', err)
    }
  }

  const loadSessionStatus = async () => {
    if (!openSession) return
    try {
      const status = await staffAPI.getSessionStatus(openSession.id)
      setSessionStatus(status)
    } catch (err) {
      console.error('Failed to load session status:', err)
    }
  }

  const handleOpenSession = async (timetableSessionId) => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const session = await staffAPI.openSession(timetableSessionId, user.staff_id)
      setOpenSession({ id: session.attendance_session_id, ...session })
      setMessage({ type: 'success', text: 'Attendance session opened successfully!' })
      loadActiveSessions()
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to open session' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) {
        setMessage({ type: 'error', text: 'Failed to capture image' })
        setLoading(false)
        return
      }

      const blob = await fetch(imageSrc).then(r => r.blob())
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' })

      const result = await staffAPI.markAttendanceWithFace(
        openSession.id,
        user.staff_id,
        file
      )

      setMessage({ 
        type: 'success', 
        text: `✓ ${result.student_name} - ${result.status}` 
      })
      
      loadSessionStatus()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to mark attendance' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSession = async () => {
    if (!window.confirm('Close this session? All unmarked students will be marked absent.')) {
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await staffAPI.closeSession(openSession.id, user.staff_id)
      setMessage({ type: 'success', text: 'Session closed successfully!' })
      setOpenSession(null)
      setSessionStatus(null)
      setShowCamera(false)
      loadActiveSessions()
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to close session' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>Logout</button>
      </div>

      <div className="container">
        {message.text && (
          <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
            {message.text}
          </div>
        )}

        {!openSession ? (
          <div className="card">
            <div className="card-header">Active Sessions</div>
            
            {activeSessions.length === 0 ? (
              <p className="text-muted">No active sessions at this time.</p>
            ) : (
              <div className="sessions-grid">
                {activeSessions.map((session) => (
                  <div key={session.session_id} className="session-card">
                    <h3>{session.subject_name}</h3>
                    <p><strong>Division:</strong> {session.division_name}</p>
                    {session.batch_name && (
                      <p><strong>Batch:</strong> {session.batch_name}</p>
                    )}
                    <p><strong>Type:</strong> {session.session_type.toUpperCase()}</p>
                    <p><strong>Time:</strong> {session.start_time} - {session.end_time}</p>
                    {session.room_number && (
                      <p><strong>Room:</strong> {session.room_number}</p>
                    )}
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => handleOpenSession(session.session_id)}
                      disabled={loading}
                    >
                      Open Attendance
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="card">
              <div className="card-header">Attendance Session - Open</div>
              
              {sessionStatus && (
                <div className="session-stats">
                  <div className="stat-box">
                    <span className="stat-value">{sessionStatus.marked_count}</span>
                    <span className="stat-label">Marked</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{sessionStatus.remaining}</span>
                    <span className="stat-label">Remaining</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{sessionStatus.total_count}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>
              )}

              <div className="attendance-marking">
                <h3>Mark Attendance (AI Face Recognition)</h3>
                <p className="text-muted">Students scan their face to mark attendance</p>

                {!showCamera ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCamera(true)}
                  >
                    Open Camera
                  </button>
                ) : (
                  <>
                    <div className="webcam-container">
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          width: 640,
                          height: 480,
                          facingMode: "user"
                        }}
                      />
                    </div>

                    <div className="camera-actions">
                      <button
                        className="btn btn-success"
                        onClick={handleMarkAttendance}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Capture & Mark'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowCamera(false)}
                      >
                        Close Camera
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="session-actions mt-3">
                <button
                  className="btn btn-danger"
                  onClick={handleCloseSession}
                  disabled={loading}
                >
                  Close Session (Mark Remaining as Absent)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffDashboard
