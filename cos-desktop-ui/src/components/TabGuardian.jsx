import { useState, useEffect, useCallback } from 'react'

/* ────────────────────────────────────────────────────────────────────────
   COS — Cognitive Tab Guardian
   Instant overlay on every tab switch · bottom-right · z-index 9999.
   ──────────────────────────────────────────────────────────────────────── */

const API = 'http://localhost:8000'

const TabGuardian = () => {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(8)
  const [context, setContext] = useState(null)
  const [switchId, setSwitchId] = useState(null)

  // Read employee token from localStorage (set during employee auth)
  const empToken = localStorage.getItem('cos_emp_token') || ''

  // Current context tracking
  const [currentApp, setCurrentApp] = useState('Browser')
  const [currentTitle, setCurrentTitle] = useState(document.title)
  const [currentFocusScore, setCurrentFocusScore] = useState(75)
  const [sessionStart] = useState(Date.now())

  // Update title tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitle(document.title)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ─── Trigger on tab switch / window blur ──────────────────────────
  useEffect(() => {
    if (!empToken) return

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const sessionMinutes = Math.round((Date.now() - sessionStart) / 60000)
        try {
          const response = await fetch(`${API}/worksense/employee/tab-switch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${empToken}`,
            },
            body: JSON.stringify({
              from_app: currentApp,
              from_title: currentTitle,
              from_focus_score: currentFocusScore,
              from_session_minutes: sessionMinutes,
              to_app: 'Unknown',
              to_title: 'Tab switched',
            }),
          })
          const data = await response.json()
          if (data.should_show_guardian) {
            setContext(data.previous_context)
            setSwitchId(data.switch_id)
            setVisible(true)
            setCountdown(8)
          }
        } catch (err) {
          console.log('[TabGuardian] API unavailable:', err.message)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [empToken, currentApp, currentTitle, currentFocusScore, sessionStart])

  // ─── Countdown timer ──────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return
    if (countdown <= 0) { setVisible(false); return }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [visible, countdown])

  // ─── Actions ──────────────────────────────────────────────────────
  const handleTakeMeBack = async () => {
    try {
      const res = await fetch(`${API}/worksense/employee/tab-switch/returned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${empToken}`,
        },
        body: JSON.stringify({ switch_id: switchId, returned: true }),
      })
      const data = await res.json()
      window.focus()
      if (data.resume_url) window.location.href = data.resume_url
    } catch (err) {
      console.log('[TabGuardian] Return API error:', err.message)
    }
    setVisible(false)
  }

  const handleStayHere = async () => {
    try {
      await fetch(`${API}/worksense/employee/tab-switch/returned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${empToken}`,
        },
        body: JSON.stringify({ switch_id: switchId, returned: false }),
      })
    } catch (err) { /* silent */ }
    setVisible(false)
  }

  const handleSnooze = () => {
    setVisible(false)
    setTimeout(() => {
      setVisible(true)
      setCountdown(8)
    }, 5 * 60 * 1000) // 5 minutes
  }

  // ─── Render ───────────────────────────────────────────────────────
  if (!visible || !context) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '380px',
      background: '#1a1a1a',
      border: '1px solid #6366f1',
      borderRadius: '12px',
      padding: '20px',
      zIndex: 9999,
      animation: 'cosSlideUp 0.3s ease-out',
      boxShadow: '0 0 24px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.4)',
      fontFamily: "'Outfit', sans-serif",
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '14px' }}>
          🧠 COS — Context Alert
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{countdown}s</span>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: 'none', border: 'none',
              color: '#a1a1aa', cursor: 'pointer', fontSize: '16px',
              padding: 0, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Context info */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '6px' }}>
          You were working on:
        </div>
        <div style={{
          color: '#ffffff', fontSize: '15px',
          fontWeight: 600, marginBottom: '8px',
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          "{context.title}"
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ color: '#6366f1', fontSize: '12px' }}>
            {context.app}
          </span>
          <span style={{ color: '#a1a1aa', fontSize: '12px' }}>
            {context.session_minutes}m
          </span>
          <span style={{ color: '#14b8a6', fontSize: '12px' }}>
            Focus: {context.focus_score}/100
          </span>
        </div>
      </div>

      {/* Question */}
      <div style={{ color: '#ffffff', fontSize: '14px', marginBottom: '16px' }}>
        Would you like to go back?
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleTakeMeBack} style={{
          flex: 1, padding: '10px', background: '#6366f1',
          color: '#fff', border: 'none', borderRadius: '8px',
          cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
        >
          ↩ Take me back
        </button>

        <button onClick={handleStayHere} style={{
          flex: 1, padding: '10px', background: '#1a1a1a',
          color: '#a1a1aa', border: '1px solid #2a2a2a',
          borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
        >
          ✓ Stay here
        </button>

        <button onClick={handleSnooze} style={{
          padding: '10px 12px', background: '#1a1a1a',
          color: '#a1a1aa', border: '1px solid #2a2a2a',
          borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
        >
          ⏰ 5m
        </button>
      </div>

      {/* Slide up animation */}
      <style>{`
        @keyframes cosSlideUp {
          from { transform: translateY(100px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default TabGuardian
