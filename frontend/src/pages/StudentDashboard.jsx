/**
 * Student Dashboard - View-only interface for students.
 * Features:
 * - View day-wise attendance
 * - View attendance percentage
 * - View late entries
 * - View recent day-wise entries
 */

import React, { useState, useEffect } from 'react'
import { studentAPI } from '../services/api'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import ThemeToggle from '../components/ThemeToggle'
import '../styles/dashboard.css'
import Table from '../ui/Table'
import Badge from '../ui/Badge'

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
      const data = await studentAPI.getAttendance(user.student_id)
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
      backgroundColor: ['#059669', '#d97706', '#dc2626'],
      borderWidth: 0
    }]
  } : null

  // Process data for a 7-day or 10-day bar chart showing recent attendance
  // Reversing so that oldest is on the left, newest on the right
  const recentDays = dashboard ? [...dashboard.recent_attendance].reverse() : []

  const dailyChartData = {
    labels: recentDays.map(a => {
      const dateStr = a.date;
      const parsed = new Date(dateStr);
      return `${parsed.getDate()}/${parsed.getMonth() + 1}`;
    }),
    datasets: [{
      label: 'Attendance Status (1=Present, 0.5=Late, 0=Absent)',
      data: recentDays.map(a => {
        if (a.status.toLowerCase() === 'present') return 1;
        if (a.status.toLowerCase() === 'late') return 0.5;
        return 0;
      }),
      backgroundColor: recentDays.map(a => {
        if (a.status.toLowerCase() === 'present') return '#059669'
        if (a.status.toLowerCase() === 'late') return '#d97706'
        return '#dc2626'
      }),
    }]
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {dashboard ? dashboard.student_info.name : user.name}</p>
          <p className="text-muted">Roll: {dashboard ? dashboard.student_info.roll_number : user.roll_number}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <button className="btn btn-danger" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="container">
        {/* Overall Statistics */}
        {dashboard && (
          <div className="grid grid-4">
            <div className="card stat-card">
              <h3>Overall Attendance</h3>
              <div className="stat-large">{dashboard.overall_statistics.percentage.toFixed(1)}%</div>
              <p className="text-muted">{dashboard.overall_statistics.total} days logged</p>
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

            <div className="card stat-card">
              <h3>Absent</h3>
              <div className="stat-large text-danger">{dashboard.overall_statistics.absent}</div>
              <p className="text-muted">Missed classes</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">Overall Attendance Distribution</div>
            {overallChartData && (
              <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                <Pie data={overallChartData} options={{ maintainAspectRatio: false }} />
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">Recent Day-wise Attendance (Last {recentDays.length} Days)</div>
            {recentDays.length > 0 ? (
              <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                <Bar
                  data={dailyChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                          callback: function (value) {
                            if (value === 1) return 'Present';
                            if (value === 0.5) return 'Late';
                            if (value === 0) return 'Absent';
                            return '';
                          }
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const val = context.raw;
                            if (val === 1) return 'Present';
                            if (val === 0.5) return 'Late';
                            return 'Absent';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No recent attendance data.
              </div>
            )}
          </div>
        </div>

        {/* Day-wise Details Grid */}
        <div className="card">
          <div className="card-header">Day-wise Attendance Details</div>
          <Table
            caption="Day-wise attendance details"
            columns={[
              { key: 'date', header: 'Date' },
              {
                key: 'status',
                header: 'Status',
                cell: (r) => (
                  <Badge
                    variant={
                      r.status?.toLowerCase() === 'present'
                        ? 'success'
                        : r.status?.toLowerCase() === 'late'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {r.status}
                  </Badge>
                ),
              },
              {
                key: 'check_in_time',
                header: 'Check-in Time',
                cell: (r) => (r.check_in_time !== 'N/A' && r.check_in_time !== '00:00:00' ? r.check_in_time : '-'),
              },
              {
                key: 'marked_method',
                header: 'Marking Method',
                cell: (r) => (r.marked_method !== 'unknown' ? r.marked_method.replace('_', ' ').toUpperCase() : '-'),
              },
            ]}
            rows={attendance || []}
            rowKey={(r, i) => `${r.date}-${i}`}
            emptyText="No daily attendance records available yet."
          />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
