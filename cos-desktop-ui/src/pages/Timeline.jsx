import { useState, useEffect } from 'react'
import { TimelineIcon, ClockIcon, AppIcon } from '../components/Icons'

const API = 'http://localhost:8000'

const SECTIONS = [
  { key: 'today',      label: 'Today',      icon: '📌', dotColor: '#3EDBF0', lineColor: 'rgba(62,219,240,0.6)' },
  { key: 'yesterday',  label: 'Yesterday',  icon: '📅', dotColor: '#77ACF1', lineColor: 'rgba(119,172,241,0.6)' },
  { key: 'last_week',  label: 'Last Week',  icon: '📆', dotColor: '#8AB4F8', lineColor: 'rgba(138,180,248,0.5)' },
  { key: 'last_month', label: 'Last Month', icon: '🗓️', dotColor: 'rgba(240,235,204,0.55)', lineColor: 'rgba(240,235,204,0.3)' },
]

function MemoryRow({ m, dotColor, index }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = async () => {
    if (m.url) window.open(m.url, '_blank')
    else {
      try {
        await fetch(`${API}/reopen`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app: m.app, title: m.title || null })
        })
      } catch {}
    }
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: hovered ? 'rgba(62,219,240,0.06)' : 'rgba(4,0,154,0.1)',
        border: `1px solid ${hovered ? 'rgba(62,219,240,0.32)' : 'rgba(119,172,241,0.1)'}`,
        borderLeft: `3px solid ${dotColor}`,
        borderRadius: 14, padding: '12px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px) translateX(2px)' : 'translateY(0) translateX(0)',
        boxShadow: hovered ? `0 6px 24px rgba(62,219,240,0.07)` : 'none',
        animation: `fadeSlideLeft 0.35s ease-out both`,
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Glowing dot */}
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: dotColor,
        boxShadow: `0 0 ${hovered ? 10 : 6}px ${dotColor}`,
        flexShrink: 0,
        transition: 'box-shadow 0.2s',
      }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          color: 'var(--cream)', fontSize: 13, fontWeight: 500, lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{m.summary || m.title}</p>
        {m.app && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <AppIcon size={10} color="rgba(240,235,204,0.3)" />
            <p style={{ color: 'rgba(240,235,204,0.35)', fontSize: 11 }}>{m.app}</p>
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {m.timestamp && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <ClockIcon size={10} />
            <span style={{ color: 'rgba(240,235,204,0.28)', fontSize: 11 }}>{m.timestamp}</span>
          </div>
        )}
        {/* Resume badge slides in on hover */}
        <div style={{
          overflow: 'hidden',
          maxWidth: hovered ? 80 : 0,
          opacity: hovered ? 1 : 0,
          transition: 'all 0.25s ease',
        }}>
          <span style={{
            display: 'block', whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg,rgba(62,219,240,0.18),rgba(119,172,241,0.12))',
            border: '1px solid rgba(62,219,240,0.35)',
            borderRadius: 8, padding: '3px 10px',
            color: '#3EDBF0', fontSize: 11, fontWeight: 600,
          }}>→ Resume</span>
        </div>
      </div>
    </div>
  )
}

export default function Timeline() {
  const [data, setData]     = useState({})
  const [loading, setLoading] = useState(true)

  const fetchTimeline = async () => {
    try { const res = await fetch(`${API}/timeline`); setData(await res.json()) }
    catch { setData({}) }
    setLoading(false)
  }

  useEffect(() => { fetchTimeline(); const t = setInterval(fetchTimeline, 30000); return () => clearInterval(t) }, [])

  if (loading) return (
    <div style={{ paddingTop: 60, textAlign: 'center' }}>
      <div style={{
        width: 38, height: 38,
        border: '2px solid transparent',
        borderTopColor: '#3EDBF0', borderRightColor: 'rgba(62,219,240,0.3)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 14px',
        boxShadow: '0 0 16px rgba(62,219,240,0.2)',
      }} />
      <p style={{ color: 'rgba(240,235,204,0.3)', fontSize: 13 }}>Loading timeline…</p>
    </div>
  )

  const totalMemories = SECTIONS.reduce((sum, s) => sum + (data[s.key]?.length || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 28 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fadeSlideUp 0.5s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'linear-gradient(135deg,rgba(62,219,240,0.18),rgba(119,172,241,0.1))',
            border: '1px solid rgba(62,219,240,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(62,219,240,0.1)',
          }}>
            <TimelineIcon active={true} size={22} />
          </div>
          <div>
            <h2 style={{
              fontSize: 26, fontWeight: 700,
              background: 'linear-gradient(135deg,#3EDBF0,#77ACF1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Timeline</h2>
            <p style={{ color: 'rgba(240,235,204,0.35)', fontSize: 12, marginTop: 2 }}>Your cognitive history</p>
          </div>
        </div>

        {totalMemories > 0 && (
          <div style={{
            background: 'rgba(62,219,240,0.07)', border: '1px solid rgba(62,219,240,0.2)',
            borderRadius: 20, padding: '5px 14px',
            fontSize: 12, color: 'rgba(62,219,240,0.8)', fontWeight: 600,
            animation: 'countUp 0.5s ease-out',
          }}>
            {totalMemories} memories
          </div>
        )}
      </div>

      {/* ── Sections ── */}
      {SECTIONS.map(sec => {
        const memories = data[sec.key] || []
        return (
          <div key={sec.key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: sec.lineColor,
                boxShadow: `0 0 8px ${sec.dotColor}`,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: sec.dotColor, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                {sec.icon}  {sec.label}
              </span>
              {memories.length > 0 && (
                <span style={{
                  background: 'rgba(4,0,154,0.3)', border: '1px solid rgba(119,172,241,0.15)',
                  borderRadius: 10, padding: '1px 8px',
                  fontSize: 10, color: 'rgba(240,235,204,0.35)',
                }}>{memories.length}</span>
              )}
            </div>

            {memories.length === 0 ? (
              <p style={{ color: 'rgba(240,235,204,0.18)', fontSize: 12, paddingLeft: 13, fontStyle: 'italic' }}>
                No memories in this period
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {memories.map((m, i) => (
                  <MemoryRow key={m.memory_id || i} m={m} dotColor={sec.dotColor} index={i} />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {totalMemories === 0 && (
        <div className="glass" style={{
          borderRadius: 18, padding: '44px', textAlign: 'center',
          animation: 'scaleIn 0.4s cubic-bezier(0.34,1.1,0.64,1)',
        }}>
          <div style={{
            fontSize: 48, marginBottom: 14,
            filter: 'drop-shadow(0 0 12px rgba(62,219,240,0.3))',
            animation: 'float 4s ease-in-out infinite',
          }}>🧠</div>
          <p style={{ color: 'rgba(240,235,204,0.5)', fontSize: 15, fontWeight: 600 }}>No memories yet</p>
          <p style={{ color: 'rgba(240,235,204,0.28)', fontSize: 12, marginTop: 7, lineHeight: 1.6 }}>
            Install the Chrome extension and browse the web<br />to start building your cognitive memory.
          </p>
        </div>
      )}
    </div>
  )
}
