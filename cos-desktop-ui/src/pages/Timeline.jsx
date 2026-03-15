// Timeline.jsx — Full space collapsible timeline
// Sections: Today · Yesterday · Last Week ·
//           Last Month · Last 2 Months · Last 6 Months
// Fetches from GET /timeline (all buckets at once)

import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const SECTIONS = [
  { key: 'today',      label: 'Today',          icon: '📅' },
  { key: 'yesterday',  label: 'Yesterday',      icon: '🕐' },
  { key: 'last_week',  label: 'Last Week',      icon: '📆' },
  { key: 'last_month', label: 'Last Month',      icon: '🗓️' },
  { key: 'last_2mo',   label: 'Last 2 Months',  icon: '📊' },
  { key: 'last_6mo',   label: 'Last 6 Months',  icon: '🗃️' },
]

// Show memory count in every section header — not just today
// Example: "Today · 47 memories" or "Yesterday · 3 memories"
// If count is 0: show "Yesterday · empty" in muted text
const SectionHeader = ({ label, icon, count, expanded, onClick }) => (
  <div onClick={onClick} style={{ cursor: 'pointer',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px 20px',
    background: '#1a1a1a', borderRadius: expanded ? '12px 12px 0 0' : '12px',
    border: '1px solid #2a2a2a' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ color: '#fff', fontWeight: 500 }}>{label}</span>
      <span style={{
        background: count > 0 ? '#6366f122' : 'transparent',
        border: `1px solid ${count > 0 ? '#6366f1' : '#2a2a2a'}`,
        color: count > 0 ? '#6366f1' : '#a1a1aa',
        borderRadius: '20px', padding: '2px 10px', fontSize: '12px'
      }}>
        {count > 0 ? `${count} memories` : 'empty'}
      </span>
    </div>
    <span style={{ color: '#a1a1aa' }}>{expanded ? '▲' : '▼'}</span>
  </div>
)

const Timeline = () => {
  const { theme }             = useTheme()
  const [sections, setSections] = useState({
    today: [], yesterday: [], last_week: [],
    last_month: [], last_2mo: [], last_6mo: []
  })
  const [open, setOpen]       = useState({ today: true })
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true)
        // Always call /timeline without params
        const res  = await fetch('http://localhost:8000/timeline')
        const data = await res.json()

        // data should be { today: [], yesterday: [], ... }
        // Handle both formats just in case
        if (Array.isArray(data)) {
          // Old format — put everything in today
          setSections({ today: data, yesterday: [],
                        last_week: [], last_month: [],
                        last_2mo: [], last_6mo: [] })
        } else {
          setSections(data)
        }
      } catch (e) {
        console.error('Timeline fetch failed:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchTimeline()
    const interval = setInterval(fetchTimeline, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleSection = (key) => {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '100%',
      minHeight: '100vh',
      background: theme.bg
    }}>

      {/* Header */}
      <div style={{ marginBottom:'32px' }}>
        <span style={{ fontSize:'11px', color:'#6366f1',
                       fontWeight:600, letterSpacing:'0.1em' }}>
          COGNITIVE MEMORY
        </span>
        <h2 style={{ fontSize:'28px', color:theme.text,
                     fontWeight:600, marginTop:'8px' }}>
          Memory Timeline
        </h2>
        <p style={{ fontSize:'14px', color:theme.textMuted,
                    marginTop:'4px' }}>
          Your complete cognitive history — click any section to expand
        </p>
      </div>

      {loading ? (
        <div style={{ padding:'32px', textAlign:'center',
                      color:theme.textMuted, fontSize:'14px' }}>
          Loading timeline...
        </div>
      ) : (
        SECTIONS.map(({ key, label, icon }) => (
          <div key={key} style={{ marginBottom:'8px' }}>
            <SectionHeader
              label={label}
              icon={icon}
              count={(sections[key] || []).length}
              expanded={open[key]}
              onClick={() => toggleSection(key)}
            />

            {/* Section content — collapsible */}
            {open[key] && (
              <div style={{
                border:       `1px solid ${theme.border}`,
                borderTop:    'none',
                borderRadius: '0 0 12px 12px',
                padding:      '0',
                overflow:     'hidden'
              }}>
                {!sections[key] || sections[key].length === 0 ? (
                  <div style={{ padding:'32px', textAlign:'center',
                                color:theme.textMuted, fontSize:'14px' }}>
                    No memories for {label.toLowerCase()} yet
                  </div>
                ) : (
                  (sections[key] || []).map((mem, i) => (
                    <div key={mem.memory_id || i} style={{
                      display:     'flex',
                      alignItems:  'center',
                      gap:         '16px',
                      padding:     '16px 20px',
                      borderBottom: i < sections[key].length - 1
                        ? `1px solid ${theme.border}` : 'none',
                      background:  i % 2 === 0
                        ? theme.bgCard : theme.bg,
                      transition:  '0.15s',
                      cursor:      'default',
                    }}
                    onMouseEnter={e =>
                      e.currentTarget.style.background = theme.bgInput
                    }
                    onMouseLeave={e =>
                      e.currentTarget.style.background =
                        i % 2 === 0 ? theme.bgCard : theme.bg
                    }>

                      {/* App icon dot */}
                      <div style={{
                        width:'10px', height:'10px',
                        borderRadius:'50%', flexShrink:0,
                        background: '#6366f1'
                      }}/>

                      {/* Memory content — full width */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{
                          fontSize:'14px', fontWeight:500,
                          color:theme.text,
                          overflow:'hidden', textOverflow:'ellipsis',
                          whiteSpace:'nowrap'
                        }}>
                          {mem.summary || mem.title}
                        </div>
                        <div style={{ fontSize:'12px',
                                      color:theme.textMuted,
                                      marginTop:'3px' }}>
                          {mem.app} · {mem.timestamp}
                        </div>
                      </div>

                      {/* App badge */}
                      <div style={{
                        fontSize:'11px', padding:'3px 10px',
                        background:theme.bgInput,
                        border:`1px solid ${theme.border}`,
                        borderRadius:'20px',
                        color:theme.textMuted,
                        flexShrink:0
                      }}>
                        {mem.app}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default Timeline
