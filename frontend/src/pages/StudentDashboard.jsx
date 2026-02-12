/**
 * Student Dashboard - View-only interface for students.
 * Features:
 * - View subject-wise attendance
 * - View attendance percentage
 * - View late entries
 * - View attendance alerts
 */

import React, { useState, useEffect } from 'react'
import { studentAPI } from '../services/api'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import '../styles/dashboard.css'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function StudentDashboard({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
    loadAttendance()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await studentAPI.getDashboard(user.student_id)
      setDashboard(data)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendance = async () => {
    try {
      const data = await studentAPI.getMyAttendance(user.student_id)
      setAttendance(data)
    } catch (err) {
      console.error('Failed to load attendance:', err)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="spinner"></div>
      </div>
    )
  }

  // Chart data for overall attendance
  const overallChartData = dashboard ? {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [{
      data: [
        dashboard.overall_statistics.present,
        dashboard.overall_statistics.late,
        dashboard.overall_statistics.absent
      ],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      borderWidth: 0
    }]
  } : null

  // Bar chart for subject-wise attendance
  const subjectChartData = {
    labels: attendance.map(a => a.subject_name),
    datasets: [{
      label: 'Attendance %',
      data: attendance.map(a => a.percentage),
      backgroundColor: attendance.map(a => 
        a.percentage >= 75 ? '#4caf50' : '#f44336'
      ),
    }]
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {user.name}</p>
          <p className="text-muted">Roll: {user.roll_number}</p>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>Logout</button>
      </div>

      <div className="container">
        {/* Overall Statistics */}
        {dashboard && (
          <div className="grid grid-3">
            <div className="card stat-card">
              <h3>Overall Attendance</h3>
              <div className="stat-large">{dashboard.overall_statistics.percentage}%</div>
              <p className="text-muted">{dashboard.overall_statistics.total} sessions</p>
            </div>
            
            <div className="card stat-card">
              <h3>Present</h3>
              <div className="stat-large text-success">{dashboard.overall_statistics.present}</div>
              <p className="text-muted">On time</p>
            </div>
            
            <div className="card stat-card">
              <h3>Late Entries</h3>
              <div className="stat-large text-warning">{dashboard.late_entries_count}</div>
              <p className="text-muted">After grace period</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">Overall Attendance Distribution</div>
            {overallChartData && (
              <div className="chart-container">
                <Pie data={overallChartData} options={{ maintainAspectRatio: false }} />
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">Subject-wise Attendance</div>
            <div className="chart-container">
              <Bar 
                data={subjectChartData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Low Attendance Alerts */}
        {dashboard && dashboard.low_attendance_alerts.length > 0 && (
          <div className="card">
            <div className="card-header">⚠️ Low Attendance Alerts</div>
            <div className="alert alert-warning">
              The following subjects have attendance below 75%:
            </div>
            <div className="alerts-grid">
              {dashboard.low_attendance_alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  <strong>{alert.subject}</strong>
                  <span className="badge badge-absent">{alert.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject-wise Details */}
        <div className="card">
          <div className="card-header">Subject-wise Attendance Details</div>
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Total</th>
                <th>Present</th>
                <th>Late</th>
                <th>Absent</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((subj) => (
                <tr key={subj.subject_id}>
                  <td>{subj.subject_name}</td>
                  <td>{subj.total}</td>
                  <td className="text-success">{subj.present}</td>
                  <td className="text-warning">{subj.late}</td>
                  <td className="text-danger">{subj.absent}</td>
                  <td>
                    <span className={`badge ${subj.percentage >= 75 ? 'badge-present' : 'badge-absent'}`}>
                      {subj.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Attendance */}
        {dashboard && dashboard.recent_attendance.length > 0 && (
          <div className="card">
            <div className="card-header">Recent Attendance</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_attendance.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date}</td>
                    <td>{record.subject}</td>
                    <td>
                      <span className={`badge badge-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{new Date(record.marked_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
