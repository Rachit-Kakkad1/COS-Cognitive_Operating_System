import { useState, useEffect, useCallback } from 'react'

/* ────────────────────────────────────────────────────────────────────────
   COS WorkSense — Manager Dashboard
   Live cognitive workforce intelligence, powered by WebSocket.
   ──────────────────────────────────────────────────────────────────────── */

const API = ''

// ─── Focus bar component ────────────────────────────────────────────────
const FocusBar = ({ score }) => {
  const filled = Math.round((score || 0) / 20)
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          width: '12px', height: '12px',
          borderRadius: '2px',
          background: i <= filled ? '#6366f1' : '#2a2a2a',
          transition: 'background 0.3s ease',
        }} />
      ))}
    </div>
  )
}

// ─── Status badge ───────────────────────────────────────────────────────
const StatusBadge = ({ status, emoji, color }) => {
  const bg = color === 'green' ? 'rgba(20,184,166,0.15)' :
             color === 'yellow' ? 'rgba(234,179,8,0.15)' :
             color === 'red' ? 'rgba(239,68,68,0.15)' : 'rgba(100,100,100,0.15)'
  const fg = color === 'green' ? '#14b8a6' :
             color === 'yellow' ? '#eab308' :
             color === 'red' ? '#ef4444' : '#a1a1aa'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '20px',
      background: bg, color: fg,
      fontSize: '12px', fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {emoji} {status}
    </span>
  )
}

// ─── Summary card ───────────────────────────────────────────────────────
const SummaryCard = ({ title, value, subtitle, accent }) => (
  <div style={{
    flex: 1, minWidth: '180px',
    background: '#111111',
    border: '1px solid #1e1e1e',
    borderRadius: '12px',
    padding: '20px',
    transition: 'border-color 0.3s',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = accent || '#6366f1'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
  >
    <div style={{ color: '#a1a1aa', fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>
      {title}
    </div>
    <div style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
      {value}
    </div>
    <div style={{ color: '#6b7280', fontSize: '12px' }}>
      {subtitle}
    </div>
  </div>
)

// ─── Report panel ───────────────────────────────────────────────────────
const ReportPanel = ({ report, loading }) => {
  if (loading) return <div style={{ color: '#a1a1aa', padding: '24px', textAlign: 'center' }}>Loading report…</div>
  if (!report) return <div style={{ color: '#6b7280', padding: '24px', textAlign: 'center' }}>Select a report tab above</div>

  return (
    <div style={{
      background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px',
      padding: '24px', marginTop: '16px', lineHeight: 1.8,
    }}>
      <pre style={{
        color: '#e5e5e5', fontFamily: "'Outfit', monospace", fontSize: '13px',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
      }}>
        {JSON.stringify(report, null, 2)}
      </pre>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════

export default function WorkSense() {
  const [managerToken, setManagerToken] = useState(localStorage.getItem('ws_manager_token') || '')
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem('ws_manager_token'))

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Dashboard state
  const [dashboard, setDashboard] = useState(null)
  const [employees, setEmployees] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [live, setLive] = useState(false)

  // Reports
  const [activeReport, setActiveReport] = useState(null) // 'hourly' | 'daily' | 'weekly'
  const [reportData, setReportData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)

  // ─── Auth ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${API}/worksense/auth/manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_email: loginEmail, manager_password: loginPassword }),
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const data = await res.json()
      setManagerToken(data.manager_token)
      localStorage.setItem('ws_manager_token', data.manager_token)
      setIsAuthed(true)
    } catch (err) {
      setLoginError(err.message || 'Login failed')
    }
  }

  const handleLogout = () => {
    setManagerToken('')
    localStorage.removeItem('ws_manager_token')
    setIsAuthed(false)
    setDashboard(null)
    setEmployees([])
  }

  // ─── Fetch dashboard ───────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (!managerToken) return
    try {
      const res = await fetch(`${API}/worksense/manager/dashboard`, {
        headers: { 'Authorization': `Bearer ${managerToken}` },
      })
      if (!res.ok) {
        if (res.status === 401) { handleLogout(); return }
        return
      }
      const data = await res.json()
      setDashboard(data)
      setEmployees(data.employees || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('[WorkSense] Dashboard fetch error:', err)
    }
  }, [managerToken])

  // Initial fetch + polling
  useEffect(() => {
    if (!isAuthed) return
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [isAuthed, fetchDashboard])

  // ─── WebSocket ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthed || !managerToken) return

    let ws
    let reconnectTimer

    const connect = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      ws = new WebSocket(`${wsProtocol}//${window.location.host}/worksense/manager/live/${managerToken}`)

      ws.onopen = () => {
        setLive(true)
        console.log('[WorkSense] WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'snapshot_update' && data.employee) {
            setEmployees(prev => prev.map(emp =>
              emp.emp_id === data.employee.emp_id
                ? { ...emp, ...data.employee }
                : emp
            ))
            setLastUpdated(new Date())
          }
        } catch (e) { /* ping messages */ }
      }

      ws.onclose = () => {
        setLive(false)
        console.log('[WorkSense] WebSocket disconnected, reconnecting in 5s…')
        reconnectTimer = setTimeout(connect, 5000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      if (ws) ws.close()
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }
  }, [isAuthed, managerToken])

  // ─── Reports ───────────────────────────────────────────────────────
  const fetchReport = async (type) => {
    setActiveReport(type)
    setReportLoading(true)
    setReportData(null)
    try {
      const res = await fetch(`${API}/worksense/manager/report/${type}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` },
      })
      const data = await res.json()
      setReportData(data)
    } catch (err) {
      setReportData({ error: 'Failed to load report' })
    }
    setReportLoading(false)
  }

  // ─── Time since last update ────────────────────────────────────────
  const [timeSince, setTimeSince] = useState('--')
  useEffect(() => {
    if (!lastUpdated) return
    const interval = setInterval(() => {
      const s = Math.round((Date.now() - lastUpdated.getTime()) / 1000)
      setTimeSince(s < 60 ? `${s} seconds ago` : `${Math.round(s / 60)} minutes ago`)
    }, 1000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  // ─── Row background ───────────────────────────────────────────────
  const rowBg = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'deep focus' || s === 'focused') return 'rgba(20,184,166,0.05)'
    if (s === 'distracted') return 'rgba(234,179,8,0.05)'
    if (s === 'off task' || s === 'idle') return 'rgba(239,68,68,0.05)'
    return 'transparent'
  }

  // ═════════════════════════════════════════════════════════════════════
  //  LOGIN SCREEN
  // ═════════════════════════════════════════════════════════════════════
  if (!isAuthed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0a', fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{
          width: '380px', background: '#111111', border: '1px solid #1e1e1e',
          borderRadius: '16px', padding: '40px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧠</div>
            <h1 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              COS WorkSense
            </h1>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '8px 0 0' }}>
              Manager Dashboard Login
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#a1a1aa', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="manager@company.com"
                style={{
                  width: '100%', padding: '10px 14px', background: '#0a0a0a',
                  border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#a1a1aa', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px', background: '#0a0a0a',
                  border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
                required
              />
            </div>
            {loginError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
                {loginError}
              </div>
            )}
            <button type="submit" style={{
              width: '100%', padding: '12px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ═════════════════════════════════════════════════════════════════════
  const summary = dashboard?.summary || {}
  const teamScore = dashboard?.team_score || 0
  const totalOnline = dashboard?.total_online || 0
  const orgName = dashboard?.org_name || 'Organization'

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      fontFamily: "'Outfit', sans-serif", color: '#ffffff',
      padding: '0 0 60px',
    }}>

      {/* ── SECTION A: Header ────────────────────────────────────────── */}
      <header style={{
        height: '80px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 32px',
        borderBottom: '1px solid #1e1e1e',
        background: 'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🧠</span>
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>COS WorkSense</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px', marginLeft: '30px' }}>
            Cognitive Workforce Intelligence
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div>
            <div style={{ color: '#e5e5e5', fontSize: '14px', fontWeight: 500 }}>
              {orgName} · <span style={{ color: '#6366f1' }}>{totalOnline}</span> employees online
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
              Last updated: {timeSince} ·{' '}
              <span style={{ color: live ? '#14b8a6' : '#ef4444' }}>
                {live ? '🟢 Live' : '🔴 Offline'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            padding: '6px 14px', background: 'transparent', border: '1px solid #2a2a2a',
            borderRadius: '6px', color: '#a1a1aa', fontSize: '12px', cursor: 'pointer',
          }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>

        {/* ── SECTION B: Summary Cards ─────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <SummaryCard
            title="Team Score"
            value={`${teamScore} / 100`}
            subtitle={teamScore >= 70 ? '↑ Above target' : teamScore >= 50 ? '→ Near target' : '↓ Below target'}
            accent="#6366f1"
          />
          <SummaryCard
            title="Deep Focus"
            value={`${(summary.deep_focus_count || 0) + (summary.focused_count || 0)}`}
            subtitle={`${totalOnline > 0 ? Math.round(((summary.deep_focus_count || 0) + (summary.focused_count || 0)) / totalOnline * 100) : 0}% of team`}
            accent="#14b8a6"
          />
          <SummaryCard
            title="Distracted"
            value={`${summary.distracted_count || 0}`}
            subtitle={`${totalOnline > 0 ? Math.round((summary.distracted_count || 0) / totalOnline * 100) : 0}% of team`}
            accent="#eab308"
          />
          <SummaryCard
            title="Off Task"
            value={`${(summary.off_task_count || 0) + (summary.idle_count || 0)}`}
            subtitle={`${totalOnline > 0 ? Math.round(((summary.off_task_count || 0) + (summary.idle_count || 0)) / totalOnline * 100) : 0}% of team`}
            accent="#ef4444"
          />
        </div>

        {/* ── SECTION C: Employee Table ────────────────────────────────── */}
        <div style={{
          background: '#111111', border: '1px solid #1e1e1e',
          borderRadius: '12px', overflow: 'hidden', marginBottom: '32px',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Team Activity</span>
            <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '12px' }}>
              {employees.length} employees
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                {['Employee', 'Current Context', 'Focus', 'Switches', 'Session', 'Status', 'Action'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    color: '#6b7280', fontSize: '11px', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                    No employees registered yet. Create an org via the API to get started.
                  </td>
                </tr>
              )}
              {employees.map(emp => (
                <tr key={emp.emp_id} style={{
                  background: rowBg(emp.status),
                  borderBottom: '1px solid #1e1e1e',
                  transition: 'background 0.3s',
                }}>
                  {/* Employee */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#e5e5e5' }}>{emp.emp_code}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{emp.name}</div>
                  </td>
                  {/* Current Context */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '13px', color: '#e5e5e5', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {emp.current_app} — {emp.current_title}
                    </div>
                  </td>
                  {/* Focus */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: emp.focus_score >= 70 ? '#14b8a6' : emp.focus_score >= 50 ? '#eab308' : '#ef4444' }}>
                        {emp.focus_score}
                      </span>
                      <FocusBar score={emp.focus_score} />
                    </div>
                  </td>
                  {/* Switches */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '13px', color: '#e5e5e5' }}>{emp.context_switches}</span>
                    <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px' }}>{emp.switch_label}</span>
                  </td>
                  {/* Session */}
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#a1a1aa' }}>
                    {emp.session_str || '--'}
                  </td>
                  {/* Status */}
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={emp.status} emoji={emp.status_emoji} color={emp.status_color} />
                  </td>
                  {/* Action */}
                  <td style={{ padding: '14px 16px' }}>
                    <button style={{
                      padding: '5px 12px', background: 'transparent',
                      border: '1px solid #2a2a2a', borderRadius: '6px',
                      color: emp.status_color === 'red' || emp.status_color === 'yellow' ? '#eab308' : '#6366f1',
                      fontSize: '11px', cursor: 'pointer', fontWeight: 500,
                    }}>
                      {emp.status_color === 'red' || emp.status_color === 'yellow' ? 'Alert' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── SECTION D: Report Tabs ───────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            {['hourly', 'daily', 'weekly'].map(type => (
              <button
                key={type}
                onClick={() => fetchReport(type)}
                style={{
                  padding: '8px 20px',
                  background: activeReport === type ? '#6366f1' : '#111111',
                  border: `1px solid ${activeReport === type ? '#6366f1' : '#2a2a2a'}`,
                  borderRadius: '8px',
                  color: activeReport === type ? '#fff' : '#a1a1aa',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <ReportPanel report={reportData} loading={reportLoading} />
        </div>
      </div>
    </div>
  )
}
