import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = ''

export default function ProductivityMatrix() {
  const navigate = useNavigate()
  const token = localStorage.getItem('ws_manager_token')
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch(`${API}/manager/productivity-matrix`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [token])

  useEffect(() => {
    if (!token) navigate('/setup')
  }, [token, navigate])

  if (!token) return null

  const d = data || {}
  const employees = d.employees || []
  const teamAvg = d.team_average ?? 0

  return (
    <div style={{ paddingTop: 48, paddingBottom: 100, minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <h1 style={{ padding: '24px 24px 8px' }}>Productivity Matrix</h1>
      <p style={{ padding: '0 24px 24px', color: '#9ca3af' }}>Score + improvement plan · Last 7 days</p>

      {employees.map((emp, i) => {
        const score = emp.productivity_score ?? 0
        const cls = emp.score_class || 'red'
        const color = cls === 'green' ? '#22c55e' : cls === 'yellow' ? '#eab308' : '#ef4444'
        return (
          <div key={i} style={{ margin: 24, padding: 24, background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span>{emp.name} · {emp.emp_code}</span>
              <span style={{ color, fontWeight: 600 }}>Score: {score}/100 {cls === 'green' ? '🟢' : cls === 'yellow' ? '🟡' : '🔴'}</span>
            </div>
            <div style={{ height: 8, background: '#1f2937', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8, fontSize: 13, color: '#9ca3af' }}>
              {emp.metrics?.avg_focus_score != null && <span>Focus: {emp.metrics.avg_focus_score}</span>}
              {emp.metrics?.avg_context_switches != null && <span>Switches: {emp.metrics.avg_context_switches}</span>}
              {emp.metrics?.avg_session_minutes != null && <span>Session: {Math.round(emp.metrics.avg_session_minutes)}m</span>}
              {emp.metrics?.idle_percentage != null && <span>Idle: {emp.metrics.idle_percentage}%</span>}
            </div>
            <p style={{ color: '#14b8a6', fontSize: 14, margin: 0 }}>💡 {emp.improvement_tip || '—'}</p>
          </div>
        )
      })}

      <div style={{ margin: 24, padding: 16, background: '#1f2937', borderRadius: 12, textAlign: 'center' }}>
        Team Average: {teamAvg}/100 ↑ +4 from last week
      </div>
    </div>
  )
}
