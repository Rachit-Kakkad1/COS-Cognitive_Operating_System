import { useState } from 'react'
import { useMode } from '../../context/ModeContext'

export default function ParentHome() {
  const { currentMode } = useMode()
  const c = currentMode.colors

  // Mock children data for demonstration
  const [children] = useState([
    { id: 1, name: 'Arjun', emoji: '🧑', app: 'Khan Academy', mins: 45, score: 85, used: 134, limit: 180, status: 'Studying' },
    { id: 2, name: 'Priya', emoji: '👧', app: 'YouTube', mins: 12, score: 20, used: 110, limit: 120, status: 'Gaming' }
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 12 }}>
      
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: c.text, marginBottom: 4 }}>Family Dashboard</h1>
        <p style={{ fontSize: 14, color: c.textMuted }}>Monitor and protect your children online.</p>
      </div>

      {/* SECTION 1: Child Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {children.map(child => (
          <div key={child.id} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 32, background: c.bg, width: 56, height: 56, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{child.emoji}</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: c.text }}>{child.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: child.status === 'Studying' ? '#10b981' : '#f59e0b' }} />
                    <span style={{ fontSize: 13, color: c.textMuted }}>{child.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 6 }}>Currently using:</div>
              <div style={{ background: c.bg, padding: '8px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: c.text, display: 'flex', justifyContent: 'space-between' }}>
                <span>{child.app}</span>
                <span style={{ color: c.primary }}>{child.mins} min</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
                <span>Screen time today</span>
                <span style={{ fontWeight: 600, color: c.text }}>{Math.floor(child.used/60)}h {child.used%60}m / {child.limit/60}h</span>
              </div>
              <div style={{ width: '100%', height: 8, background: c.bg, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(child.used/child.limit)*100}%`, height: '100%', background: (child.used/child.limit) > 0.9 ? '#ef4444' : c.primary, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        ))}
        {/* Add child card */}
        <div style={{ background: 'transparent', border: `2px dashed ${c.border}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 240, color: c.textMuted }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
          <div style={{ fontWeight: 600 }}>Add Child Profile</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* SECTION 3: Controls */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 20 }}>Screen Time Controls</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: `1px solid ${c.border}` }}>
              <div>
                <div style={{ fontWeight: 600, color: c.text, fontSize: 14 }}>Bedtime Lock</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>Block all apps after 9:00 PM</div>
              </div>
              <div style={{ width: 44, height: 24, background: c.primary, borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, background: '#fff', borderRadius: 10 }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: c.text, fontSize: 14 }}>Homework Hour</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>4:00 PM - 5:00 PM (Edu apps only)</div>
              </div>
              <div style={{ width: 44, height: 24, background: c.primary, borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, background: '#fff', borderRadius: 10 }} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Weekly Report */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 20 }}>Weekly Summary</h3>
          <div style={{ background: c.bg, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: c.text, marginBottom: 8 }}>"Arjun studied 12.4 hours this week 📚"</p>
            <p style={{ fontSize: 14, color: c.text }}>"Screen time was 18% below limit — great week! ✅"</p>
          </div>
          <button style={{ width: '100%', border: `1px solid ${c.primary}`, background: 'transparent', color: c.primary, padding: 12, borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
            Download Full Report
          </button>
        </div>

      </div>
    </div>
  )
}
