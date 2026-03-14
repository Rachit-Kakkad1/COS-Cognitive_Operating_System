// Timeline.jsx — Full space collapsible timeline
// Sections: Today · Yesterday · Last Week ·
//           Last Month · Last 2 Months · Last 6 Months
// Each section: collapsible with open/close animation
// Full width cards — no empty space

import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const SECTIONS = [
  { key: 'today',        label: 'Today',          icon: '📅' },
  { key: 'yesterday',    label: 'Yesterday',       icon: '🕐' },
  { key: 'last_week',    label: 'Last Week',       icon: '📆' },
  { key: 'last_month',   label: 'Last Month',      icon: '🗓️' },
  { key: 'last_2months', label: 'Last 2 Months',   icon: '📊' },
  { key: 'last_6months', label: 'Last 6 Months',   icon: '🗃️' },
]

const Timeline = () => {
  const { theme }                   = useTheme()
  const [data, setData]             = useState({})
  const [open, setOpen]             = useState({ today: true })
  const [loading, setLoading]       = useState({})

  const toggleSection = async (key) => {
    const isOpening = !open[key]
    setOpen(prev => ({ ...prev, [key]: isOpening }))

    // Lazy load — only fetch when opening
    if (isOpening && !data[key]) {
      setLoading(prev => ({ ...prev, [key]: true }))
      try {
        const res  = await fetch(`/timeline?period=${key}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cos_token')}`
          }
        })
        const json = await res.json()
        setData(prev => ({ ...prev, [key]: json.memories || [] }))
      } catch (e) {
        setData(prev => ({ ...prev, [key]: [] }))
      }
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  // Load today on mount
  useEffect(() => { toggleSection('today') }, [])

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

      {/* Sections */}
      {SECTIONS.map(({ key, label, icon }) => (
        <div key={key} style={{ marginBottom:'8px' }}>

          {/* Section header — always visible · clickable */}
          <div onClick={() => toggleSection(key)} style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            padding:        '16px 20px',
            background:     theme.bgCard,
            border:         `1px solid ${theme.border}`,
            borderRadius:   open[key] ? '12px 12px 0 0' : '12px',
            cursor:         'pointer',
            transition:     '0.2s',
            userSelect:     'none',
          }}>
            <div style={{ display:'flex',
                          alignItems:'center', gap:'12px' }}>
              <span style={{ fontSize:'18px' }}>{icon}</span>
              <span style={{ fontSize:'16px', fontWeight:600,
                             color:theme.text }}>{label}</span>
              {data[key] && (
                <span style={{
                  fontSize:'12px', color:theme.textMuted,
                  background:theme.bgInput,
                  padding:'2px 10px', borderRadius:'20px'
                }}>
                  {data[key].length} memories
                </span>
              )}
            </div>
            <span style={{ color:theme.textMuted, fontSize:'18px',
                           transition:'0.2s',
                           transform: open[key] ? 'rotate(180deg)' : 'rotate(0)' }}>
              ▾
            </span>
          </div>

          {/* Section content — collapsible */}
          {open[key] && (
            <div style={{
              border:       `1px solid ${theme.border}`,
              borderTop:    'none',
              borderRadius: '0 0 12px 12px',
              padding:      '0',
              overflow:     'hidden'
            }}>
              {loading[key] ? (
                <div style={{ padding:'32px', textAlign:'center',
                              color:theme.textMuted, fontSize:'14px' }}>
                  Loading {label.toLowerCase()} memories...
                </div>
              ) : !data[key] || data[key].length === 0 ? (
                <div style={{ padding:'32px', textAlign:'center',
                              color:theme.textMuted, fontSize:'14px' }}>
                  No memories for {label.toLowerCase()} yet
                </div>
              ) : (
                data[key].map((mem, i) => (
                  <div key={mem.memory_id || i} style={{
                    display:     'flex',
                    alignItems:  'center',
                    gap:         '16px',
                    padding:     '16px 20px',
                    borderBottom: i < data[key].length - 1
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
      ))}
    </div>
  )
}

export default Timeline
