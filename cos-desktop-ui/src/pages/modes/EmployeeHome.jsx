import { useState, useEffect } from 'react'
import { useMode } from '../../context/ModeContext'

export default function EmployeeHome() {
  const { currentMode } = useMode()
  const c = currentMode.colors

  const [perf, setPerf] = useState(null)
  const [tip, setTip] = useState(null)
  const [goals, setGoals] = useState([
    { id: 1, text: 'Complete API authentication module', done: false },
    { id: 2, text: 'Review 3 PRs', done: true },
    { id: 3, text: '4 hours deep focus', done: false }
  ])

  useEffect(() => {
    Promise.all([
      fetch('/worksense/employee/my-performance', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`/mode/coach-tip?mode=employee`).then(r => r.json())
    ]).then(([p, t]) => {
      setPerf(p)
      setTip(t)
    }).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 12 }}>
      
      {/* SECTION 1: Greeting & Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: c.text, marginBottom: 8 }}>Good morning! 👔</h1>
          <div style={{ alignItems: 'center', gap: 8, color: c.accent, fontWeight: 600, background: 'rgba(22, 163, 74, 0.1)', padding: '6px 12px', borderRadius: 8, display: 'inline-flex' }}>
            <span>↑ 12 points from yesterday 🚀</span>
          </div>
        </div>
        
        {/* Performance Gauge Placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: 50, border: `8px solid ${c.border}`, borderTopColor: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: c.text }}>
            {perf?.performance_score || 84}
          </div>
          <div style={{ fontSize: 12, color: c.textMuted, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Performance</div>
        </div>
      </div>

      {/* SECTION 6: Burnout early warning */}
      {perf?.burnout_risk !== 'low' && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: 12, padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: 24 }}>🟡</div>
          <div>
            <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Heads up: Watch your energy levels</div>
            <div style={{ color: c.textMuted, fontSize: 13 }}>{perf?.burnout_message || "You've worked 6 days straight with declining focus scores. Consider scheduling recovery time."}</div>
          </div>
        </div>
      )}

      {/* SECTION 3: Personal COS coach */}
      <div style={{ background: `linear-gradient(135deg, ${c.surface}, ${c.bg})`, border: `1px solid ${c.primary}40`, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: c.primary, marginBottom: 8 }}>💡 Your COS Coach says:</h3>
        <p style={{ fontSize: 16, color: c.text, lineHeight: 1.5 }}>
          {tip?.tip || "You do your best work between 10am–12pm. Block this time for your hardest task today."}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 24 }}>
        
        {/* SECTION 2: Daily goals */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.text }}>Today's Goals</h3>
            <span style={{ fontSize: 12, color: c.textMuted }}>{goals.filter(g=>g.done).length} of {goals.length} complete</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {goals.map(g => (
              <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={g.done} onChange={() => {
                  setGoals(goals.map(x => x.id === g.id ? {...x, done: !x.done} : x))
                }} style={{ width: 18, height: 18, accentColor: c.primary }} />
                <span style={{ fontSize: 14, color: g.done ? c.textMuted : c.text, textDecoration: g.done ? 'line-through' : 'none' }}>{g.text}</span>
              </label>
            ))}
          </div>
          <button style={{ width: '100%', padding: 10, background: 'transparent', border: `1px dashed ${c.border}`, color: c.textMuted, borderRadius: 8, cursor: 'pointer' }}>+ Add goal</button>
        </div>

        {/* SECTION 4: Focus session launcher */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 20 }}>Deep Work Session</h3>
          <input type="text" placeholder="What are you working on?" style={{ width: '100%', padding: '12px 16px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, marginBottom: 16, fontSize: 14 }} />
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['25m', '50m', '90m'].map(t => (
               <button key={t} style={{ flex: 1, padding: '8px 0', background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>{t}</button>
            ))}
          </div>

          <button style={{ width: '100%', padding: 14, background: c.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            🚀 Start Deep Focus Session
          </button>
        </div>

      </div>

      {/* SECTION 7: Work/life balance meter */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: c.textMuted }}>Work hours today: <span style={{ color: c.text, fontWeight: 600 }}>8h 24m</span></span>
          <span style={{ fontSize: 14, color: c.textMuted }}>Recommended: 8h max</span>
        </div>
        <div style={{ width: '100%', height: 12, background: c.bg, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: '105%', height: '100%', background: '#ef4444', borderRadius: 6 }} />
        </div>
        <div style={{ marginTop: 12, color: '#ef4444', fontSize: 13, fontWeight: 600 }}>Time to log off — you've hit your limit 👏</div>
      </div>

    </div>
  )
}
