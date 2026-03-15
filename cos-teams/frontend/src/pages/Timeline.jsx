import { useState, useEffect } from 'react'

const API = ''
const SECTIONS = [
  { key: 'today', label: 'Today', icon: '📅' },
  { key: 'yesterday', label: 'Yesterday', icon: '🕐' },
  { key: 'last_week', label: 'Last Week', icon: '📆' },
  { key: 'last_month', label: 'Last Month', icon: '🗓️' },
  { key: 'last_2mo', label: 'Last 2 Months', icon: '📊' },
  { key: 'last_6mo', label: 'Last 6 Months', icon: '🗃️' },
]

export default function Timeline() {
  const [sections, setSections] = useState({ today: [], yesterday: [], last_week: [], last_month: [], last_2mo: [], last_6mo: [] })
  const [open, setOpen] = useState({ today: true })
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('cos_teams_member_token')

  useEffect(() => {
    if (!token) return
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`${API}/timeline`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setSections(Array.isArray(data) ? { today: data, yesterday: [], last_week: [], last_month: [], last_2mo: [], last_6mo: [] } : data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchTimeline()
    const t = setInterval(fetchTimeline, 30000)
    return () => clearInterval(t)
  }, [token])

  if (!token) return <div style={{ padding: 24, color: '#a1a1aa' }}>Sign in to see timeline.</div>

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, color: '#fff', marginBottom: 24 }}>Memory Timeline</h2>
      {loading ? <p style={{ color: '#a1a1aa' }}>Loading...</p> : SECTIONS.map(({ key, label, icon }) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div onClick={() => setOpen(o => ({ ...o, [key]: !o[key] }))} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: open[key] ? '12px 12px 0 0' : '12px' }}>
            <span>{icon} {label}</span>
            <span style={{ color: '#f59e0b' }}>{(sections[key] || []).length} memories</span>
            <span>{open[key] ? '▲' : '▼'}</span>
          </div>
          {open[key] && (
            <div style={{ border: '1px solid #2a2a2a', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 16 }}>
              {(sections[key] || []).length === 0 ? <p style={{ color: '#a1a1aa', fontSize: 14 }}>No memories</p> : (sections[key] || []).map((mem, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < sections[key].length - 1 ? '1px solid #2a2a2a' : 'none' }}>
                  <div style={{ color: '#fff' }}>{mem.summary || mem.title}</div>
                  <div style={{ color: '#a1a1aa', fontSize: 12 }}>{mem.app} · {mem.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
