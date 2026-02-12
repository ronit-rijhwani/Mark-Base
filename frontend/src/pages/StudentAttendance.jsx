/**
 * Student Attendance Page - Simple Face Scanning Only
 * No dashboard, no login - just mark attendance
 */

import React, { useState, useRef, useEffect } from 'react'
import Webcam from 'react-webcam'
import { staffAPI } from '../services/api'
import '../styles/dashboard.css'

function StudentAttendance() {
  const webcamRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [openSessions, setOpenSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  // Fetch open sessions on component mount
  useEffect(() => {
    fetchOpenSessions()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOpenSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOpenSessions = async (divisionId = null) => {
    try {
      // Get open sessions, optionally filtered by division
      const sessions = await staffAPI.getOpenSessions(divisionId)
      setOpenSessions(sessions)
      
      // Auto-select first session if available
      if (sessions.length > 0 && !selectedSession) {
        setSelectedSession(sessions[0])
      } else if (sessions.length === 0) {
        setSelectedSession(null)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleStartAttendance = () => {
    if (!selectedSession) {
      showToast('No attendance session is currently open', 'error')
      return
    }
    setShowCamera(true)
  }

  const handleCaptureFace = async () => {
    setIsProcessing(true)
    
    try {
      const imageSrc = webcamRef.current.getScreenshot()
      
      if (!imageSrc) {
        showToast('Failed to capture image', 'error')
        setIsProcessing(false)
        return
      }

      // Convert base64 to blob
      const blob = await fetch(imageSrc).then(r => r.blob())
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' })
      
      // Mark attendance via face recognition (no staff_id needed)
      const response = await staffAPI.markAttendanceWithFace(
        selectedSession.attendance_session_id,
        null,  // staff_id not needed
        file
      )
      
      showToast(`✅ Attendance Marked Successfully! Status: ${response.status}`, 'success')
      setShowCamera(false)
      
      // Refresh session list after marking
      setTimeout(fetchOpenSessions, 1000)
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to mark attendance. Please try again.'
      showToast(errorMsg, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="attendance-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="attendance-container">
        <div className="attendance-header">
          <h1>📸 Mark Your Attendance</h1>
          <p>Scan your face to mark attendance</p>
        </div>

        {!showCamera ? (
          <div className="attendance-start">
            <div className="attendance-card">
              <div className="icon-large">📷</div>
              <h2>Ready to Mark Attendance?</h2>
              
              {isLoadingSessions ? (
                <p>Loading sessions...</p>
              ) : openSessions.length === 0 ? (
                <div>
                  <p style={{ color: '#e74c3c' }}>❌ No attendance session is currently open</p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>Please wait for your teacher to start the session</p>
                  <button 
                    className="btn btn-secondary" 
                    onClick={fetchOpenSessions}
                    style={{ marginTop: '1rem' }}
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
                    <p><strong>Active Session:</strong></p>
                    <p>📚 Subject: {selectedSession?.subject}</p>
                    <p>📍 Division: {selectedSession?.division}</p>
                    <p>👨‍🏫 Staff: {selectedSession?.staff_name}</p>
                    <p>🕐 Time: {selectedSession?.start_time} - {selectedSession?.end_time}</p>
                  </div>
                  
                  <p>Click the button below to open camera and scan your face</p>
                  <button 
                    className="btn btn-primary btn-large" 
                    onClick={handleStartAttendance}
                  >
                    Start Face Scan
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="attendance-scan">
            <div className="camera-box">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
                className="webcam-fullscreen"
              />
              
              <div className="camera-overlay">
                <div className="face-guide">
                  <div className="face-guide-circle"></div>
                  <p>Position your face in the circle</p>
                </div>
              </div>
            </div>

            <div className="camera-controls">
              <button 
                className="btn btn-success btn-large" 
                onClick={handleCaptureFace}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : '✓ Capture & Mark Attendance'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowCamera(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAttendance
