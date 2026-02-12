/**
 * Parent Dashboard - View child's attendance data.
 * Features:
 * - View child's overall attendance
 * - View subject-wise attendance
 * - View late and absent records
 * - View daily attendance log
 */

import React, { useState, useEffect } from 'react'
import { parentAPI } from '../services/api'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import '../styles/dashboard.css'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function ParentDashboard({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [dailyLog, setDailyLog] = useState([])
  const [lateRecords, setLateRecords] = useState(null)
  const [absentRecords, setAbsentRecords] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      const [dashData, attData, logData, lateData, absentData] = await Promise.all([
        parentAPI.getDashboard(user.parent_id),
        parentAPI.getChildAttendance(user.parent_id),
        parentAPI.getChildDailyLog(user.parent_id, 30),
        parentAPI.getChildLateRecords(user.parent_id),
        parentAPI.getChildAbsentRecords(user.parent_id)
      ])
      
      setDashboard(dashData)
      setAttendance(attData)
      setDailyLog(logData)
      setLateRecords(lateData)
      setAbsentRecords(absentData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="spinner"></div>
      </div>
    )
  }

  // Chart data
  const overallChartData = dashboard ? {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [{
      data: [
        dashboard.overall_statistics.present,
        dashboard.overall_statistics.late,
        dashboard.overall_statistics.absent
      ],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
    }]
  } : null

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
          <h1>Parent Dashboard</h1>
          <p>Welcome, {user.name}</p>
          {dashboard && (
            <p className="text-muted">
              Child: {dashboard.child_info.name} ({dashboard.child_info.roll_number})
            </p>
          )}
        </div>
        <button className="btn btn-danger" onClick={onLogout}>Logout</button>
      </div>

      <div className="container">
        {/* Navigation Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            Subjects
          </button>
          <button
            className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Log
          </button>
          <button
            className={`tab ${activeTab === 'late' ? 'active' : ''}`}
            onClick={() => setActiveTab('late')}
          >
            Late Entries
          </button>
          <button
            className={`tab ${activeTab === 'absent' ? 'active' : ''}`}
            onClick={() => setActiveTab('absent')}
          >
            Absences
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboard && (
          <>
            <div className="grid grid-3">
              <div className="card stat-card">
                <h3>Overall Attendance</h3>
                <div className="stat-large">{dashboard.overall_statistics.percentage}%</div>
                <p className="text-muted">{dashboard.overall_statistics.total} sessions</p>
              </div>
              
              <div className="card stat-card">
                <h3>Recent Late Entries</h3>
                <div className="stat-large text-warning">{dashboard.recent_late_count}</div>
                <p className="text-muted">Last 7 days</p>
              </div>
              
              <div className="card stat-card">
                <h3>Recent Absences</h3>
                <div className="stat-large text-danger">{dashboard.recent_absent_count}</div>
                <p className="text-muted">Last 7 days</p>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <div className="card-header">Attendance Distribution</div>
                {overallChartData && (
                  <div className="chart-container">
                    <Pie data={overallChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-header">Last 7 Days</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.last_7_days_attendance.map((record, index) => (
                      <tr key={index}>
                        <td>{record.date}</td>
                        <td>
                          <span className={`badge badge-${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <>
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

            <div className="card">
              <div className="card-header">Details</div>
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
          </>
        )}

        {/* Daily Log Tab */}
        {activeTab === 'daily' && (
          <div className="card">
            <div className="card-header">Daily Attendance Log (Last 30 Days)</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {dailyLog.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date}</td>
                    <td>{record.day}</td>
                    <td>{record.subject}</td>
                    <td>
                      <span className={`badge badge-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.marked_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Late Entries Tab */}
        {activeTab === 'late' && lateRecords && (
          <div className="card">
            <div className="card-header">Late Entries ({lateRecords.total_late_entries})</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Marked At</th>
                  <th>Delay (mins)</th>
                </tr>
              </thead>
              <tbody>
                {lateRecords.late_records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date}</td>
                    <td>{record.subject}</td>
                    <td>{record.marked_at}</td>
                    <td className="text-warning">{record.delay_minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Absences Tab */}
        {activeTab === 'absent' && absentRecords && (
          <div className="card">
            <div className="card-header">Absences ({absentRecords.total_absences})</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Subject</th>
                  <th>Session Time</th>
                </tr>
              </thead>
              <tbody>
                {absentRecords.absent_records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date}</td>
                    <td>{record.day}</td>
                    <td>{record.subject}</td>
                    <td>{record.session_time}</td>
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

export default ParentDashboard
