/**
 * Parent Dashboard - View child's attendance data.
 * Features:
 * - View child's overall attendance
 * - View late and absent records
 * - View daily attendance log
 * - Switch between multiple children (child switcher dropdown)
 */

import React, { useState, useEffect } from 'react'
import { parentAPI } from '../services/api'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import ThemeToggle from '../components/ThemeToggle'
import '../styles/dashboard.css'
import Table from '../ui/Table'
import Badge from '../ui/Badge'
import AppShell from '../layout/AppShell'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function ParentDashboard({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null)
  const [dailyLog, setDailyLog] = useState([])
  const [lateRecords, setLateRecords] = useState(null)
  const [absentRecords, setAbsentRecords] = useState(null)
  const [presentRecords, setPresentRecords] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Multi-child support
  const [children, setChildren] = useState(user.children || [])
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [childDropdownOpen, setChildDropdownOpen] = useState(false)

  useEffect(() => {
    // If children came from login data, use them; otherwise fetch from API
    if (user.children && user.children.length > 0) {
      setChildren(user.children)
      setSelectedChildId(user.children[0].student_id)
    } else {
      // Fetch children from API
      loadChildren()
    }
  }, [])

  useEffect(() => {
    if (selectedChildId) {
      loadAllData(selectedChildId)
    }
  }, [selectedChildId])

  const loadChildren = async () => {
    try {
      const pId = user.parent_id || user.id
      const childrenData = await parentAPI.getChildren(pId)
      setChildren(childrenData)
      if (childrenData.length > 0) {
        setSelectedChildId(childrenData[0].student_id)
      }
    } catch (err) {
      console.error('Failed to load children:', err)
    }
  }

  const loadAllData = async (studentId) => {
    setLoading(true)
    try {
      const pId = user.parent_id || user.id

      const [dashData, logData, lateData, absentData, presentData] = await Promise.all([
        parentAPI.getDashboard(pId, studentId),
        parentAPI.getChildAttendance(pId, studentId),
        parentAPI.getChildLateRecords(pId, studentId),
        parentAPI.getChildAbsentRecords(pId, studentId),
        parentAPI.getChildPresentRecords(pId, studentId)
      ])
      
      setDashboard(dashData)
      setDailyLog(logData)
      setLateRecords(lateData)
      setAbsentRecords(absentData)
      setPresentRecords(presentData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChildSwitch = (studentId) => {
    setSelectedChildId(studentId)
    setChildDropdownOpen(false)
  }

  const selectedChild = children.find(c => c.student_id === selectedChildId)

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
      borderWidth: 0
    }]
  } : null


  // Process data for a 7-day bar chart showing recent attendance
  const recentDays = dashboard ? [...dashboard.last_7_days_attendance].reverse() : []
  
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
        if (a.status.toLowerCase() === 'present') return '#4caf50';
        if (a.status.toLowerCase() === 'late') return '#ff9800';
        return '#f44336';
      }),
    }]
  }


  return (
    <AppShell
      title="Parent"
      subtitle={
        dashboard
          ? `Viewing · ${dashboard.child_info.name} (${dashboard.child_info.roll_number})${dashboard.child_info.division ? ` · ${dashboard.child_info.division}` : ''}`
          : `Welcome · ${user.name}`
      }
      navItems={[
        { value: 'overview', label: 'Overview' },
        { value: 'daily', label: 'Daily Log' },
        { value: 'late', label: 'Late Entries' },
        { value: 'absent', label: 'Absences' },
        { value: 'present', label: 'Present Days' },
      ]}
      navValue={activeTab}
      onNavChange={setActiveTab}
      actions={
        <>
          {children.length > 1 && (
            <div className="child-switcher" style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setChildDropdownOpen(!childDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {selectedChild ? selectedChild.name : 'Select Child'} <span aria-hidden="true">▼</span>
              </button>

              {childDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                    onClick={() => setChildDropdownOpen(false)}
                  />
                  <div
                    className="card child-dropdown-card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: 200,
                      maxWidth: 'min(320px, calc(100vw - 32px))',
                      zIndex: 100,
                      padding: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Switch Child
                    </div>
                    {children.map((child) => (
                      <button
                        key={child.student_id}
                        type="button"
                        onClick={() => handleChildSwitch(child.student_id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          border: 'none',
                          background: child.student_id === selectedChildId ? 'rgba(5, 150, 105, 0.08)' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{child.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {child.roll_number}
                          {child.department && ` • ${child.department}`}
                          {child.class_name && ` • ${child.class_name}`}
                          {child.division && ` — Div ${child.division}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <ThemeToggle />
          <button className="btn btn-danger" onClick={onLogout}>Logout</button>
        </>
      }
    >

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboard && (
          <>
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="card stat-card">
                <h3>Overall Attendance</h3>
                <div className="stat-large">{dashboard.overall_statistics.percentage.toFixed(1)}%</div>
                <p className="text-muted">{dashboard.overall_statistics.total} total days logged</p>
              </div>
              
              <div className="card stat-card">
                <h3>Recent Present</h3>
                <div className="stat-large" style={{ color: '#4caf50' }}>{dashboard.recent_present_count || 0}</div>
                <p className="text-muted">Last 7 days</p>
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
                  <div className="chart-container" style={{ position: 'relative', minHeight: '300px' }}>
                    <Pie data={overallChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                )}
              </div>

               <div className="card">
                <div className="card-header">Last {recentDays.length} Days View</div>
                {recentDays.length > 0 ? (
                  <div className="chart-container" style={{ position: 'relative', minHeight: '300px' }}>
                    <Bar 
                      data={dailyChartData} 
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 1,
                            ticks: {
                              callback: function(value) {
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
                              label: function(context) {
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
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        No recent attendance data.
                    </div>
                )}
               </div>
            </div>
          </>
        )}


        {/* Daily Log Tab */}
        {activeTab === 'daily' && (
          <div className="card">
            <div className="card-header">Daily Attendance Log (Last 30 Days)</div>
            <Table
              caption="Daily attendance log"
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'day', header: 'Day' },
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
                { key: 'marked_at', header: 'Time In', cell: (r) => (r.marked_at !== 'N/A' ? r.marked_at : '-') },
              ]}
              rows={dailyLog || []}
              rowKey={(r, i) => `${r.date}-${i}`}
              emptyText="No daily log records available."
            />
          </div>
        )}

        {/* Late Entries Tab */}
        {activeTab === 'late' && lateRecords && (
          <div className="card">
            <div className="card-header">Late Entries ({lateRecords.total_late_entries})</div>
            <Table
              caption="Late entries"
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'marked_at', header: 'Marked At' },
              ]}
              rows={lateRecords.late_records || []}
              rowKey={(r, i) => `${r.date}-${i}`}
              emptyText="No late records found."
            />
          </div>
        )}

        {/* Absences Tab */}
        {activeTab === 'absent' && absentRecords && (
          <div className="card">
            <div className="card-header">Absences ({absentRecords.total_absences})</div>
            <Table
              caption="Absences"
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'day', header: 'Day' },
              ]}
              rows={absentRecords.absent_records || []}
              rowKey={(r, i) => `${r.date}-${i}`}
              emptyText="No absences recorded."
            />
          </div>
        )}

        {/* Present Tab */}
        {activeTab === 'present' && presentRecords && (
          <div className="card">
            <div className="card-header">Present Days ({presentRecords.total_present})</div>
            <Table
              caption="Present days"
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'marked_at', header: 'Marked At' },
              ]}
              rows={presentRecords.present_records || []}
              rowKey={(r, i) => `${r.date}-${i}`}
              emptyText="No present records found."
            />
          </div>
        )}
    </AppShell>
  )
}

export default ParentDashboard
