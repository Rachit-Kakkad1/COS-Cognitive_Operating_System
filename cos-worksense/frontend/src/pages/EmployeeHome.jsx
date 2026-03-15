import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = ''

export default function EmployeeHome() {
  const navigate = useNavigate()
  const token = localStorage.getItem('ws_emp_token')
  const orgName = localStorage.getItem('ws_org_name') || ''
  const empCode = localStorage.getItem('ws_emp_code') || ''
  const name = localStorage.getItem('ws_emp_name') || 'Employee'
  const [dismissBanner, setDismissBanner] = useState(() => JSON.parse(localStorage.getItem('ws_banner_dismiss') || 'false'))
  const [goals, setGoals] = useState([])
  const [goalInput, setGoalInput] = useState('')
  const [performance, setPerformance] = useState(null)
  const [coachTip, setCoachTip] = useState('Your peak focus is 10am–12pm. Block this time — no meetings, no Slack.')

  useEffect(() => {
    if (!token) { navigate('/setup'); return }
  }, [token, navigate])

  useEffect(() => {
    const raw = localStorage.getItem('ws_goals')
    if (raw) try { setGoals(JSON.parse(raw)); } catch (_) {}
  }, [])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/employee/my-performance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setPerformance)
      .catch(() => {})
  }, [token])

  const saveGoals = (g) => {
    setGoals(g)
    localStorage.setItem('ws_goals', JSON.stringify(g))
    if (token) fetch(`${API}/employee/goals`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ goals: g }) }).catch(() => {})
  }

  const addGoal = () => {
    if (!goalInput.trim()) return
    saveGoals([...goals, goalInput.trim()])
    setGoalInput('')
  }

  const removeGoal = (i) => {
    saveGoals(goals.filter((_, idx) => idx !== i))
  }

  const dismissBannerToday = () => {
    setDismissBanner(true)
    const d = new Date().toDateString()
    localStorage.setItem('ws_banner_dismiss', JSON.stringify(true))
    localStorage.setItem('ws_banner_dismiss_date', d)
  }

  const completed = goals.filter((_, i) => false) // placeholder: no toggle in spec
  const pct = goals.length ? Math.round((completed.length / goals.length) * 100) : 0
  const score = performance?.avg_focus_score ?? 0
  const trend = performance?.trend ?? 'stable'
  const burnoutRisk = performance?.burnout_risk ?? 'low'
  const achievements = performance?.achievements ?? []
  const workHours = 8.25

  if (!token) return null

  return (
    <div style={{ paddingTop: 48, paddingBottom: 100, minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <h1 style={{ padding: '24px 24px 8px', fontSize: 24 }}>Good morning, {name} 👔</h1>
      <p style={{ padding: '0 24px 24px', color: '#9ca3af' }}>{orgName} · {empCode}</p>

      {!dismissBanner && (
        <div style={{ margin: 24, padding: 20, background: '#0a0f1e', borderLeft: '4px solid #14b8a6', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>🔒 COS WorkSense is active</div>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 12 }}>
            Your manager can see: which app · focus score · context switches.<br />
            Your manager CANNOT see: screen content · keystrokes · messages.<br />
            You are always informed — never surveilled.
          </p>
          <button type="button" onClick={dismissBannerToday} style={{ padding: '8px 16px', background: '#14b8a6', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Got it ✓</button>
        </div>
      )}

      <div style={{ margin: 24, padding: 24, background: '#111', border: '1px solid #1f2937', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Your focus score today</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444' }}>{score}</div>
        <div style={{ color: '#9ca3af', marginTop: 8 }}>Trend: ↑ +12 from yesterday 🚀</div>
      </div>

      <div style={{ margin: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Today's Goals (private — manager cannot see)</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {goals.map((g, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span>☐</span>
              <span>{g}</span>
              <button type="button" onClick={() => removeGoal(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input type="text" value={goalInput} onChange={e => setGoalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} placeholder="Add goal" style={{ flex: 1, padding: 10, background: '#0f0f0f', border: '1px solid #1f2937', borderRadius: 8, color: '#fff' }} />
          <button type="button" onClick={addGoal} style={{ padding: '10px 20px', background: '#14b8a6', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer' }}>+ Add goal</button>
        </div>
        <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>Progress: {goals.length ? '1 of ' + goals.length + ' complete' : '0 goals'}</p>
      </div>

      <div style={{ margin: 24, padding: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', borderRadius: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 Your COS Coach</div>
        <p style={{ color: '#e5e5e5', fontSize: 14 }}>{coachTip}</p>
      </div>

      <div style={{ margin: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {['🔥 Top Performer', '🎯 Focus Master', '⚡ Deep Worker', '🌟 Streak King'].map(badge => (
          <span key={badge} style={{ padding: '8px 12px', background: achievements.includes(badge) ? '#14b8a622' : '#2a2a2a', color: achievements.includes(badge) ? '#14b8a6' : '#6b7280', borderRadius: 20, fontSize: 13 }}>{badge}</span>
        ))}
      </div>

      {(burnoutRisk === 'medium' || burnoutRisk === 'high') && (
        <div style={{ margin: 24, padding: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 12 }}>
          <div style={{ fontWeight: 600, color: '#ef4444' }}>⚠️ Heads up: declining focus over 3 days</div>
          <p style={{ color: '#e5e5e5', fontSize: 14 }}>Consider scheduling recovery time.</p>
        </div>
      )}

      <div style={{ margin: 24 }}>
        <div style={{ marginBottom: 8 }}>Work hours today: {workHours}h</div>
        <div style={{ height: 8, background: '#1f2937', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, (workHours / 8) * 100)}%`, height: '100%', background: workHours > 8 ? '#ef4444' : '#22c55e', borderRadius: 4 }} />
        </div>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Recommended: 8h max</p>
      </div>
    </div>
  )
}
