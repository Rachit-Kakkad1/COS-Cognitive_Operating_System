import { useState, useEffect } from 'react'

const API = 'http://localhost:8004'

export default function OverlayRecall() {
  const [recall, setRecall] = useState(null)
  const [visible, setVisible] = useState(false)
  const [intervention, setIntervention] = useState(null)

  useEffect(() => {
    let lastIntTs = null
    let lastRecallId = null

    // WebSocket for real-time interventions
    const ws = new WebSocket(`ws://${window.location.hostname}:8004/intervention/ws`)
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'intervention' && data.timestamp !== lastIntTs) {
          lastIntTs = data.timestamp
          setIntervention(data)
          setVisible(true)
        }
      } catch (err) { console.error("WS Error:", err) }
    }

    const interval = setInterval(async () => {
      try {
        // 1. Intervention Polling (fallback)
        if (!intervention) {
          const intRes = await fetch(`${API}/intervention/status`)
          const intData = await intRes.json()
          if (intData.active && intData.timestamp !== lastIntTs) {
            lastIntTs = intData.timestamp
            setIntervention(intData)
            setVisible(true)
          }
        }

        // 2. Normal hotkey recall
        const res  = await fetch(`${API}/hotkey/recall`, { method: 'POST' })
        const data = await res.json()
        if (data.result && data.result.memory_id !== lastRecallId) {
          lastRecallId = data.result.memory_id
          setRecall({ ...data.result, type: 'recall' })
          setIntervention(null) // prioritize recall if triggered
          setVisible(true)
          setTimeout(() => setVisible(false), 8000)
        }
      } catch { /* backend offline */ }
    }, 2000)

    return () => {
      clearInterval(interval)
      ws.close()
    }
  }, [intervention])

  const handleResponse = async (ans) => {
    try {
      await fetch(`${API}/intervention/respond`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: ans })
      })
      if (ans === 'yes') {
        await fetch(`${API}/intervention/reopen`, { method: 'POST' })
      }
    } catch {}
    setVisible(false)
    setIntervention(null)
  }

  const handleRecallResume = async () => {
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

  if (!visible || (!recall && !intervention)) return null

  const isIntervention = !!intervention
  const data = intervention || recall

  return (
    <div style={{
      position: 'fixed', bottom: 84, right: 16, zIndex: 1000, maxWidth: 360,
      animation: 'slideInRight 0.32s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Card */}
      <div style={{
        background: isIntervention
          ? 'rgba(10, 15, 30, 0.95)'
          : 'rgba(2, 0, 21, 0.92)',
        border: `1px solid ${isIntervention ? 'rgba(255, 87, 87, 0.4)' : 'rgba(62, 219, 240, 0.4)'}`,
        borderRadius: 20, padding: '20px',
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        boxShadow: isIntervention
          ? '0 20px 60px rgba(255, 87, 87, 0.15), 0 0 0 1px rgba(255, 87, 87, 0.1)'
          : '0 16px 48px rgba(62, 219, 240, 0.12), 0 0 0 1px rgba(62, 219, 240, 0.06)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: isIntervention ? 'rgba(255, 87, 87, 0.1)' : 'rgba(62, 219, 240, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18
            }}>
              {isIntervention ? '⚠️' : '🧠'}
            </div>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: isIntervention ? '#FF5757' : '#3EDBF0',
              }}>
                {isIntervention ? 'Drift Intervention' : 'Context Recall'}
              </div>
              <div style={{ color: 'rgba(240,235,204,0.5)', fontSize: 10 }}>
                {isIntervention ? 'Focus Dip Detected' : 'Memory Restored'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: 'none', border: 'none', color: 'rgba(240,235,204,0.25)',
              cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0
            }}
          >×</button>
        </div>

        {/* Content */}
        {isIntervention ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: 'var(--cream)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              You drifted from <b>{intervention.from_app}</b> to <b>{intervention.to_app}</b>.
              Your focus score was <b>{intervention.focus_score}%</b>.
            </p>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px',
              borderLeft: '3px solid #FF5757', fontSize: 12, color: 'rgba(240,235,204,0.7)'
            }}>
              "Would you like to go back?"
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--cream)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            {data.summary}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {isIntervention ? (
            <>
              <button
                onClick={() => handleResponse('yes')}
                style={{
                  flex: 1, background: '#FF5757', color: 'white', border: 'none',
                  borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'transform 0.2s'
                }}
              >Yes, Take me back</button>
              <button
                onClick={() => handleResponse('no')}
                style={{
                  flex: 0.4, background: 'rgba(255,255,255,0.05)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer'
                }}
              >No</button>
            </>
          ) : (
            <button
              onClick={handleRecallResume}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #3EDBF0, #00A8FF)',
                color: 'white', border: 'none', borderRadius: 10, padding: '10px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}
            >
              {data.url ? 'Open in Browser' : 'Restore App'}
            </button>
          )}
        </div>

        {/* Footer info */}
        {!isIntervention && (
          <div style={{ color: 'rgba(240,235,204,0.3)', fontSize: 10, textAlign: 'center' }}>
            {data.app} · {data.timestamp}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        b { color: white; font-weight: 700; }
      `}</style>
    </div>
  )
}
