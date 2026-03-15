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
  const [buckets, setBuckets] = useState({ today: [], yesterday: [], last_week: [], last_month: [], last_2mo: [], last_6mo: [] })
  const [open, setOpen] = useState({ today: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API}/timeline`)
        const data = await res.json()
        if (Array.isArray(data)) setBuckets({ today: data, yesterday: [], last_week: [], last_month: [], last_2mo: [], last_6mo: [] })
        else setBuckets(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchTimeline()
    const t = setInterval(fetchTimeline, 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ paddingTop: 48, paddingBottom: 100, minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <h1 style={{ padding: '24px 24px 8px' }}>Timeline</h1>
      <p style={{ padding: '0 24px 24px', color: '#9ca3af' }}>Memories by period</p>
      {loading && <p style={{ padding: 24, color: '#9ca3af' }}>Loading…</p>}
      {!loading && SECTIONS.map(({ key, label, icon }) => {
        const items = buckets[key] || []
        const expanded = open[key]
        return (
          <div key={key} style={{ margin: '0 24px 24px' }}>
            <div onClick={() => setOpen(o => ({ ...o, [key]: !o[key] }))} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#111', border: '1px solid #1f2937', borderRadius: expanded ? '12px 12px 0 0' : 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span>{label}</span>
                <span style={{ color: items.length ? '#14b8a6' : '#9ca3af', fontSize: 12 }}>{items.length ? `${items.length} memories` : 'empty'}</span>
              </div>
              <span>{expanded ? '▲' : '▼'}</span>
            </div>
            {expanded && (
              <div style={{ padding: 16, background: '#111', border: '1px solid #1f2937', borderTop: 'none', borderRadius: '0 0 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {items.map((mem, i) => (
                  <div key={i} style={{ padding: 12, background: '#0f0f0f', borderLeft: '4px solid #14b8a6', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#14b8a6' }}>{mem.app || '—'}</div>
                    <div style={{ fontWeight: 500 }}>{(mem.title || mem.summary || '').slice(0, 60)}{(mem.title || mem.summary || '').length > 60 ? '…' : ''}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{mem.timestamp || ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
