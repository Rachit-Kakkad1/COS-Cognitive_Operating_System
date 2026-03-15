import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = ''

export default function Goals() {
  const navigate = useNavigate()
  const token = localStorage.getItem('ws_emp_token')
  const [goals, setGoals] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!token) { navigate('/setup'); return }
    const raw = localStorage.getItem('ws_goals')
    if (raw) try { setGoals(JSON.parse(raw)); } catch (_) {}
  }, [token, navigate])

  const saveGoals = (g) => {
    setGoals(g)
    localStorage.setItem('ws_goals', JSON.stringify(g))
    if (token) fetch(`${API}/employee/goals`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ goals: g }) }).catch(() => {})
  }

  const add = () => {
    if (!input.trim()) return
    saveGoals([...goals, input.trim()])
    setInput('')
  }

  const remove = (i) => { saveGoals(goals.filter((_, idx) => idx !== i)) }

  if (!token) return null

  return (
    <div style={{ paddingTop: 48, paddingBottom: 100, minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <h1 style={{ padding: '24px 24px 8px' }}>Today's Goals</h1>
      <p style={{ padding: '0 24px 24px', color: '#9ca3af' }}>Private — manager cannot see</p>
      <div style={{ padding: 24 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {goals.map((g, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: 12, background: '#111', borderRadius: 8 }}>
              <span>☐</span>
              <span style={{ flex: 1 }}>{g}</span>
              <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add goal" style={{ flex: 1, padding: 12, background: '#0f0f0f', border: '1px solid #1f2937', borderRadius: 8, color: '#fff' }} />
          <button type="button" onClick={add} style={{ padding: '12px 20px', background: '#14b8a6', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>+ Add</button>
        </div>
      </div>
    </div>
  )
}
