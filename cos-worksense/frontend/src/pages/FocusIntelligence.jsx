import { useState, useEffect } from 'react'

const API = ''

export default function FocusIntelligence() {
  const token = localStorage.getItem('ws_manager_token') || localStorage.getItem('ws_emp_token')
  const isManager = !!localStorage.getItem('ws_manager_token')
  const [period, setPeriod] = useState('today')
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!token) return
    if (isManager) {
      fetch(`${API}/manager/focus-intelligence?period=${period}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(setData)
        .catch(() => setData(null))
    } else {
      fetch(`${API}/employee/my-performance`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setData({ org_avg_score: d.avg_focus_score, all_employees: [{ name: 'You', avg_focus_score: d.avg_focus_score }], recommendation: 'Based on your patterns.' }))
        .catch(() => setData(null))
    }
  }, [token, period, isManager])

  if (!token) return <div style={{ padding: 24, color: '#9ca3af' }}>Sign in to view focus intelligence.</div>

  const d = data || {}
  const score = d.org_avg_score ?? 0
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'

  return (
    <div style={{ paddingTop: 48, paddingBottom: 100, minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <h1 style={{ padding: '24px 24px 8px' }}>Focus Intelligence</h1>
      <div style={{ padding: '0 24px 24px', display: 'flex', gap: 8 }}>
        {['today', 'week', 'month'].map(p => (
          <button key={p} type="button" onClick={() => setPeriod(p)} style={{ padding: '8px 16px', background: period === p ? '#14b8a6' : '#1f2937', color: period === p ? '#000' : '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', textTransform: 'capitalize' }}>{p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'Today'}</button>
        ))}
      </div>

      <div style={{ margin: 24, padding: 24, background: '#111', border: '1px solid #1f2937', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Focus Score</div>
        <div style={{ width: 120, height: 120, borderRadius: '50%', border: `8px solid ${color}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>{score}</div>
      </div>

      <div style={{ margin: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}><div style={{ color: '#9ca3af', fontSize: 12 }}>Peak Focus</div><div style={{ fontSize: 18, fontWeight: 600 }}>10am–12pm</div></div>
        <div style={{ padding: 16, background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}><div style={{ color: '#9ca3af', fontSize: 12 }}>Deep Sessions</div><div style={{ fontSize: 18, fontWeight: 600 }}>7</div></div>
        <div style={{ padding: 16, background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}><div style={{ color: '#9ca3af', fontSize: 12 }}>Switches/day</div><div style={{ fontSize: 18, fontWeight: 600 }}>11.2</div></div>
        <div style={{ padding: 16, background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}><div style={{ color: '#9ca3af', fontSize: 12 }}>Idle Time</div><div style={{ fontSize: 18, fontWeight: 600 }}>5.1%</div></div>
      </div>

      <div style={{ margin: 24, padding: 20, background: '#111', border: '1px solid #14b8a6', borderRadius: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 COS Recommendation</div>
        <p style={{ color: '#9ca3af', margin: 0 }}>{d.recommendation || 'Maintain focus patterns.'}</p>
      </div>

      {isManager && d.all_employees?.length > 0 && (
        <div style={{ margin: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Team by focus score</h2>
          <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 12, overflow: 'hidden' }}>
            {d.all_employees.map((emp, i) => (
              <div key={i} style={{ padding: 12, borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{emp.name}</span>
                <span style={{ color: '#14b8a6', fontWeight: 600 }}>{emp.avg_focus_score ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
