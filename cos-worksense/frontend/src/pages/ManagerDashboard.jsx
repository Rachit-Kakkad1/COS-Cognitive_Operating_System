import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API = ''
const WS_BASE = (typeof window !== 'undefined' && window.location?.origin) ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}` : 'ws://localhost:5176'

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('ws_manager_token')
  const [dashboard, setDashboard] = useState(null)
  const [reportTab, setReportTab] = useState('hourly')
  const [reportData, setReportData] = useState(null)
  const [drawerEmp, setDrawerEmp] = useState(null)
  const [lastUpdatedAgo, setLastUpdatedAgo] = useState('')

  const fetchDashboard = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API}/manager/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setDashboard(data)
    } catch (e) { console.error(e) }
  }, [token])

  useEffect(() => {
    if (!token) { navigate('/setup'); return }
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 10000)
    return () => clearInterval(interval)
  }, [token, fetchDashboard, navigate])

  useEffect(() => {
    if (!token) return
    const wsUrl = `${API.replace(/^http/, 'ws')}/manager/live/${token}`
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const ws = new WebSocket(`${proto}//${host}/manager/live/${token}`)
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'snapshot_update' && msg.employee) {
          setDashboard(prev => {
            if (!prev) return prev
            const employees = prev.employees.map(e => e.emp_id === msg.employee.emp_id ? { ...e, ...msg.employee } : e)
            return { ...prev, employees }
          })
        }
      } catch (_) {}
    }
    return () => ws.close()
  }, [token])

  useEffect(() => {
    if (!token || !reportTab) return
    const url = `/manager/report/${reportTab}`
    fetch(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setReportData)
      .catch(() => setReportData(null))
  }, [token, reportTab])

  useEffect(() => {
    const t = setInterval(() => {
      if (!dashboard?.employees) return
      const withTime = dashboard.employees.find(e => e.last_updated && e.last_updated.includes('s ago'))
      if (withTime) setLastUpdatedAgo(withTime.last_updated)
    }, 1000)
    return () => clearInterval(t)
  }, [dashboard])

  if (!token) return null
  const d = dashboard || {}
  const sum = d.summary || {}
  const employees = d.employees || []

  return (
    <div style={{ paddingTop: 48, paddingBottom: 100, minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>🏢 {d.org_name || '—'} · WorkSense Dashboard</div>
        <div style={{ color: '#9ca3af' }}>Team score: {d.team_score ?? 0}/100 · {d.total_online ?? 0} employees online</div>
        <div style={{ color: '#9ca3af' }}>Last: {lastUpdatedAgo || '—'} · 🟢 Live</div>
      </header>

      <div style={{ display: 'flex', gap: 16, padding: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180, background: '#111', border: '1px solid #14b8a6', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Team Score</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{d.team_score ?? 0} / 100</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>↑ +4 today</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#111', border: '1px solid #22c55e', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Deep Focus</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{sum.deep_focus_count ?? 0} employees</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>50%</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#111', border: '1px solid #eab308', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Distracted</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{sum.distracted_count ?? 0} employees</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>25%</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#111', border: '1px solid #ef4444', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Off Task</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{sum.off_task_count ?? 0} employee</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>12%</div>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111', borderRadius: 12, overflow: 'hidden' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937' }}>
              <th style={{ padding: 12, textAlign: 'left', width: 200 }}>Employee</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Current Context</th>
              <th style={{ padding: 12, width: 120 }}>Focus</th>
              <th style={{ padding: 12, width: 100 }}>Switches</th>
              <th style={{ padding: 12, width: 100 }}>Session</th>
              <th style={{ padding: 12, width: 140 }}>Status</th>
              <th style={{ padding: 12, width: 80 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr
                key={emp.emp_id}
                style={{
                  borderBottom: '1px solid #1f2937',
                  background: emp.status === 'deep_focus' ? 'rgba(20,184,166,0.04)' : emp.status === 'distracted' ? 'rgba(234,179,8,0.04)' : emp.status === 'off_task' ? 'rgba(239,68,68,0.04)' : 'transparent',
                }}
              >
                <td style={{ padding: 12 }}>{emp.emp_code} · {emp.name}</td>
                <td style={{ padding: 12 }}>{emp.current_app} — {emp.current_title}</td>
                <td style={{ padding: 12 }}>
                  <span style={{ fontFamily: 'monospace' }}>{emp.focus_bar}</span> {emp.focus_score}
                </td>
                <td style={{ padding: 12 }}>{emp.context_switches}</td>
                <td style={{ padding: 12 }}>{emp.session_minutes >= 60 ? `${Math.floor(emp.session_minutes/60)}h ${emp.session_minutes%60}m` : `${emp.session_minutes}m`}</td>
                <td style={{ padding: 12 }}>{emp.status_emoji} {emp.status?.replace('_', ' ')}</td>
                <td style={{ padding: 12 }}>
                  <button type="button" onClick={() => setDrawerEmp(emp)} style={{ background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', fontSize: 18 }}>→</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['hourly', 'daily', 'weekly'].map(tab => (
            <button key={tab} type="button" onClick={() => setReportTab(tab)} style={{ padding: '8px 16px', background: reportTab === tab ? '#14b8a6' : '#1f2937', color: reportTab === tab ? '#000' : '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', textTransform: 'capitalize' }}>{tab}</button>
          ))}
        </div>
        <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 12, padding: 24 }}>
          <pre style={{ color: '#e5e5e5', fontSize: 13, whiteSpace: 'pre-wrap', margin: 0 }}>{reportData ? JSON.stringify(reportData, null, 2) : 'Loading…'}</pre>
        </div>
      </div>

      {drawerEmp && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100%', background: '#111', borderLeft: '1px solid #1f2937', zIndex: 1001, padding: 24, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3>{drawerEmp.name} · {drawerEmp.emp_code}</h3>
            <button type="button" onClick={() => setDrawerEmp(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 24 }}>×</button>
          </div>
          <p style={{ color: '#9ca3af' }}>Context: {drawerEmp.current_app} — {drawerEmp.current_title}</p>
          <p>Focus score: {drawerEmp.focus_score}/100</p>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Today's timeline (mini) — Burnout risk: —</p>
          <button type="button" onClick={() => setDrawerEmp(null)} style={{ marginTop: 16, padding: '10px 20px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Close</button>
        </div>
      )}
    </div>
  )
}
