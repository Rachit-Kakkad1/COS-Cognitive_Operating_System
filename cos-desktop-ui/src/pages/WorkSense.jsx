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
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`w-3 h-3 rounded-[2px] transition-colors duration-300 ${i <= filled ? 'bg-cos-primary' : 'bg-white/5'}`} />
      ))}
    </div>
  )
}

// ─── Status badge ───────────────────────────────────────────────────────
const StatusBadge = ({ status, emoji, color }) => {
  let badgeClasses = 'bg-zinc-800 text-zinc-400 border-zinc-700'
  if (color === 'green') badgeClasses = 'bg-teal-500/10 text-teal-400 border-teal-500/20'
  else if (color === 'yellow') badgeClasses = 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  else if (color === 'red') badgeClasses = 'bg-red-500/10 text-red-500 border-red-500/20'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClasses} whitespace-nowrap`}>
      {emoji} {status}
    </span>
  )
}

// ─── Summary card ───────────────────────────────────────────────────────
const SummaryCard = ({ title, value, subtitle, accentClass }) => (
  <div className={`flex-1 min-w-[180px] bg-cos-card border border-cos-border rounded-xl p-5 transition-colors duration-300 hover:border-cos-primary/50 group`}>
    <div className="text-cos-muted text-xs font-bold tracking-wider uppercase mb-2 group-hover:text-white transition-colors">
      {title}
    </div>
    <div className="text-3xl font-extrabold text-white mb-1">
      {value}
    </div>
    <div className={`text-xs font-medium ${accentClass || 'text-cos-muted'}`}>
      {subtitle}
    </div>
  </div>
)

// ─── Report panel ───────────────────────────────────────────────────────
const ReportPanel = ({ report, loading }) => {
  if (loading) return <div className="text-cos-muted p-8 text-center text-sm font-medium animate-pulse">Generating cognitive report...</div>
  if (!report) return <div className="text-cos-muted p-8 text-center text-sm">Select a report criteria to generate insights.</div>

  return (
    <div className="bg-[#0f0f11] border border-cos-border rounded-xl p-6 mt-4 shadow-inner">
      <pre className="text-zinc-300 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">
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
    if (s === 'deep focus' || s === 'focused') return 'bg-teal-500/5 hover:bg-teal-500/10'
    if (s === 'distracted') return 'bg-amber-500/5 hover:bg-amber-500/10'
    if (s === 'off task' || s === 'idle') return 'bg-red-500/5 hover:bg-red-500/10'
    return 'hover:bg-white/5'
  }

  // ═════════════════════════════════════════════════════════════════════
  //  LOGIN SCREEN
  // ═════════════════════════════════════════════════════════════════════
  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cos-bg font-sans px-4">
        <div className="w-full max-w-sm bg-cos-card border border-cos-border rounded-xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cos-primary to-teal-400" />

          <div className="text-center mb-8">
            <div className="text-3xl mb-3 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">🧠</div>
            <h1 className="text-white text-xl font-bold tracking-tight">COS WorkSense</h1>
            <p className="text-cos-muted text-xs font-medium mt-1">Manager Dashboard Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-cos-muted text-xs font-bold uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="manager@company.com"
                className="w-full bg-[#09090b] border border-cos-border text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-cos-primary focus:ring-1 focus:ring-cos-primary transition-all placeholder:text-zinc-600"
                required
              />
            </div>
            <div>
              <label className="block text-cos-muted text-xs font-bold uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#09090b] border border-cos-border text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-cos-primary focus:ring-1 focus:ring-cos-primary transition-all placeholder:text-zinc-600"
                required
              />
            </div>
            {loginError && (
              <div className="text-red-400 text-xs font-medium text-center bg-red-500/10 py-2 rounded-md border border-red-500/20">
                {loginError}
              </div>
            )}
            <button type="submit" className="w-full bg-cos-primary hover:bg-cos-primaryHover text-white font-semibold text-sm py-3 rounded-lg transition-colors shadow-lg shadow-cos-primary/20">
              Sign In to WorkSense
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
    <div className="min-h-screen bg-cos-bg font-sans text-white pb-16">

      {/* ── SECTION A: Header ────────────────────────────────────────── */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-cos-border bg-cos-bg/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cos-primary/10 border border-cos-primary/20 flex items-center justify-center text-cos-primary shadow-sm text-lg">
            🧠
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">COS WorkSense</h1>
            <p className="text-[10px] text-cos-muted font-bold uppercase tracking-widest text-cos-primary/80">Cognitive Workforce</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-white">
              {orgName} · <span className="text-cos-primary">{totalOnline}</span> online
            </div>
            <div className="text-[11px] text-cos-muted font-medium mt-0.5 flex items-center justify-end gap-1.5">
              Updated {timeSince} ·
              <span className={`flex items-center gap-1 ${live ? 'text-teal-400' : 'text-red-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-teal-400 animate-pulse' : 'bg-red-500'}`} />
                {live ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs font-semibold text-cos-muted hover:text-white transition-colors border border-cos-border hover:border-cos-muted/50 px-3 py-1.5 rounded-lg">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-10">

        {/* ── SECTION B: Summary Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Team Score"
            value={`${teamScore}/100`}
            subtitle={teamScore >= 70 ? '↑ Exceeding targets' : teamScore >= 50 ? '→ Stabilized' : '↓ Attention required'}
            accentClass={teamScore >= 70 ? 'text-teal-400' : teamScore >= 50 ? 'text-amber-500' : 'text-red-500'}
          />
          <SummaryCard
            title="Deep Focus"
            value={`${(summary.deep_focus_count || 0) + (summary.focused_count || 0)}`}
            subtitle={`${totalOnline > 0 ? Math.round(((summary.deep_focus_count || 0) + (summary.focused_count || 0)) / totalOnline * 100) : 0}% capacity utilization`}
            accentClass="text-teal-400"
          />
          <SummaryCard
            title="Distracted"
            value={`${summary.distracted_count || 0}`}
            subtitle={`${totalOnline > 0 ? Math.round((summary.distracted_count || 0) / totalOnline * 100) : 0}% capacity blocked`}
            accentClass="text-amber-500"
          />
          <SummaryCard
            title="Off Task"
            value={`${(summary.off_task_count || 0) + (summary.idle_count || 0)}`}
            subtitle={`${totalOnline > 0 ? Math.round(((summary.off_task_count || 0) + (summary.idle_count || 0)) / totalOnline * 100) : 0}% capacity idle`}
            accentClass="text-red-500"
          />
        </div>

        {/* ── SECTION C: Employee Table ────────────────────────────────── */}
        <div className="bg-cos-card border border-cos-border rounded-xl overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-4 border-b border-cos-border flex justify-between items-center bg-[#131315]">
            <h3 className="text-sm font-bold text-white">Live Operations Grid</h3>
            <span className="text-xs font-medium text-cos-muted bg-white/5 px-2.5 py-1 rounded-full">{employees.length} Active Nodes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f0f11] border-b border-cos-border">
                  {['Employee', 'Current Context', 'Cognitive Focus', 'Switches', 'Session', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-6 py-3 text-[10px] font-bold text-cos-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cos-border">
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium text-cos-muted bg-[#0f0f11]">
                      Org grid empty. Provision employees via the API console.
                    </td>
                  </tr>
                )}
                {employees.map(emp => (
                  <tr key={emp.emp_id} className={`${rowBg(emp.status)} transition-colors duration-200`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-white">{emp.emp_code}</div>
                      <div className="text-[11px] font-medium text-cos-muted mt-0.5">{emp.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-200 max-w-[240px] truncate" title={`${emp.current_app} — ${emp.current_title}`}>
                        {emp.current_title || 'Idle'}
                      </div>
                      <div className="text-[10px] font-bold text-cos-primary uppercase tracking-widest mt-1">
                        {emp.current_app || '--'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold w-6 ${emp.focus_score >= 70 ? 'text-teal-400' : emp.focus_score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          {emp.focus_score}
                        </span>
                        <FocusBar score={emp.focus_score} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-200">{emp.context_switches} <span className="text-xs text-cos-muted">/hr</span></div>
                      <div className="text-[10px] font-semibold text-cos-muted mt-0.5 uppercase tracking-wider">{emp.switch_label}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-cos-muted">
                      {emp.session_str || '--:--:--'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={emp.status} emoji={emp.status_emoji} color={emp.status_color} />
                    </td>
                    <td className="px-6 py-4">
                      <button className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border transition-all ${emp.status_color === 'red' || emp.status_color === 'yellow' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20' : 'bg-cos-primary/10 text-cos-primary border-cos-primary/30 hover:bg-cos-primary/20'}`}>
                        {emp.status_color === 'red' || emp.status_color === 'yellow' ? 'Intervene' : 'Audit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION D: Report Tabs ───────────────────────────────────── */}
        <div className="bg-cos-card border border-cos-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Automated Insight Reports</h3>
            <div className="flex bg-[#0f0f11] border border-cos-border rounded-lg p-1">
              {['hourly', 'daily', 'weekly'].map(type => (
                <button
                  key={type}
                  onClick={() => fetchReport(type)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${activeReport === type ? 'bg-cos-primary text-white shadow-sm' : 'text-cos-muted hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <ReportPanel report={reportData} loading={reportLoading} />
        </div>

      </div>
    </div>
  )
}
