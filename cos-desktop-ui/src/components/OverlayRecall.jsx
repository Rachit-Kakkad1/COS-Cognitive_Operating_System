import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

export default function OverlayRecall() {
  const [recall, setRecall] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let lastRecallId  = null
    let lastSwitchTs  = null

    const interval = setInterval(async () => {
      try {
        // 1. Context switch check (higher priority)
        const switchRes  = await fetch(`${API}/switch_status`)
        const switchData = await switchRes.json()
        if (switchData.event && switchData.event.timestamp !== lastSwitchTs) {
          lastSwitchTs = switchData.event.timestamp
          const prev = switchData.event.from
          setRecall({ ...prev, type: 'switch', message: `Switched from ${prev.app}. Go back?` })
          setVisible(true)
          setTimeout(() => setVisible(false), 8000)
          return
        }

        // 2. Normal hotkey recall
        const res  = await fetch(`${API}/hotkey/recall`, { method: 'POST' })
        const data = await res.json()
        if (data.result && data.result.memory_id !== lastRecallId) {
          lastRecallId = data.result.memory_id
          setRecall({ ...data.result, type: 'recall' })
          setVisible(true)
          setTimeout(() => setVisible(false), 8000)
        }
      } catch { /* backend offline */ }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleResume = async () => {
    if (recall.url) window.open(recall.url, '_blank')
    else {
      try {
        await fetch(`${API}/reopen`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app: recall.app, title: recall.title || null })
        })
      } catch {}
    }
    setVisible(false)
  }

  if (!visible || !recall) return null

  const isSwitch = recall.type === 'switch'

  return (
    <div style={{
      position: 'fixed', bottom: 84, right: 16, zIndex: 1000, maxWidth: 340,
      animation: 'slideInRight 0.32s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Card */}
      <div style={{
        background: isSwitch
          ? 'rgba(4,0,80,0.92)'
          : 'rgba(2,0,21,0.92)',
        border: `1px solid ${isSwitch ? 'rgba(119,172,241,0.45)' : 'rgba(62,219,240,0.4)'}`,
        borderRadius: 20, padding: '18px 20px',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        boxShadow: isSwitch
          ? '0 16px 48px rgba(119,172,241,0.12), 0 0 0 1px rgba(119,172,241,0.08)'
          : '0 16px 48px rgba(62,219,240,0.12), 0 0 0 1px rgba(62,219,240,0.06)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>

        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 18,
              filter: `drop-shadow(0 0 8px ${isSwitch ? '#77ACF1' : '#3EDBF0'})`,
            }}>
              {isSwitch ? '⚡' : '🧠'}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: isSwitch ? '#77ACF1' : '#3EDBF0',
            }}>
              {isSwitch ? 'Context Switch' : 'COS Recall'}
            </span>
          </div>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: 'none', border: 'none', color: 'rgba(240,235,204,0.25)',
              cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(240,235,204,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,204,0.25)'}
          >×</button>
        </div>

        {/* Message */}
        <p style={{ color: 'var(--cream)', fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
          {isSwitch ? recall.message : recall.summary}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(240,235,204,0.3)', fontSize: 11 }}>
            {isSwitch ? recall.title : `${recall.app} · ${recall.timestamp}`}
          </span>
          <button
            onClick={handleResume}
            style={{
              background: isSwitch
                ? 'linear-gradient(135deg,rgba(119,172,241,0.2),rgba(119,172,241,0.1))'
                : 'linear-gradient(135deg,rgba(62,219,240,0.2),rgba(62,219,240,0.1))',
              border: `1px solid ${isSwitch ? 'rgba(119,172,241,0.4)' : 'rgba(62,219,240,0.4)'}`,
              borderRadius: 8, padding: '6px 14px',
              color: isSwitch ? '#77ACF1' : '#3EDBF0',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 16px ${isSwitch ? 'rgba(119,172,241,0.3)' : 'rgba(62,219,240,0.3)'}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            {isSwitch ? '← Take me back' : (recall.url ? 'Resume →' : 'Dismiss')}
          </button>
        </div>

        {/* Auto-dismiss progress bar */}
        <div style={{ height: 2, background: 'rgba(240,235,204,0.06)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg,${isSwitch ? '#77ACF1' : '#3EDBF0'},${isSwitch ? '#77ACF1aa' : '#3EDBF0aa'})`,
            boxShadow: `0 0 8px ${isSwitch ? 'rgba(119,172,241,0.5)' : 'rgba(62,219,240,0.5)'}`,
            borderRadius: 1,
            animation: 'shrink 8s linear forwards',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}
