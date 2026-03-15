import { useState, useEffect, useCallback } from 'react'
import { useMode } from '../context/ModeContext'

/* ────────────────────────────────────────────────────────────────────────
   COS — Cognitive Tab Guardian
   Instant overlay on every tab switch · bottom-right · z-index 9999.
   ──────────────────────────────────────────────────────────────────────── */

const API = ''

const TabGuardian = () => {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(8)
  const [context, setContext] = useState(null)
  const [switchId, setSwitchId] = useState(null)
  
  const { currentMode } = useMode()

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

  // Check feature flag for TabGuardian
  if (currentMode && currentMode.features.tabGuardian === false) return null

  const isChild = currentMode?.id === 'child'
  const isStudent = currentMode?.id === 'student'
  const isEmployee = currentMode?.id === 'employee'
  
  const c = currentMode?.colors || {
    primary: '#6366f1', surface: '#1a1a1a', border: '#6366f1', text: '#ffffff', textMuted: '#a1a1aa', bg: '#0f0f0f', accent: '#f59e0b'
  }

  const titleMsg = isChild ? "Hey! You were learning! 📚" : (isStudent ? "Study Context Alert" : "🧠 COS — Context Alert")
  const prevContextMsg = isChild ? "You were learning about:" : (isStudent ? "You were studying:" : "You were working on:")
  const questionMsg = isChild ? "Want to go back to learning? 📚" : (isStudent ? "Want to get back to studying? 🚀" : (isEmployee ? "Jump back in? 💪" : "Would you like to go back?"))
  const yesBtn = isChild ? "Yes! Back to learning! 🚀" : (isStudent ? "Yes, back to study" : "↩ Take me back")

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '380px',
      background: c.surface,
      border: `2px solid ${c.primary}`,
      borderRadius: '16px',
      padding: '24px',
      zIndex: 9999,
      animation: 'cosSlideUp 0.3s ease-out',
      boxShadow: `0 0 24px ${c.primary}30, 0 8px 32px rgba(0,0,0,0.4)`,
      fontFamily: "'Outfit', sans-serif",
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: c.primary, fontWeight: 700, fontSize: '15px' }}>
          {titleMsg}
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: c.textMuted, fontSize: '13px', fontWeight: 600 }}>{countdown}s</span>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: 'none', border: 'none',
              color: c.textMuted, cursor: 'pointer', fontSize: '18px',
              padding: 0, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Context info */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ color: c.textMuted, fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
          {prevContextMsg}
        </div>
        <div style={{
          color: c.text, fontSize: '16px',
          fontWeight: 600, marginBottom: '12px',
          padding: '12px', background: c.bg, borderRadius: '8px', border: `1px solid ${c.border}`,
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          "{context.title}"
        </div>
        
        {!isChild && (
           <div style={{ display: 'flex', gap: '16px' }}>
             <span style={{ color: c.primary, fontSize: '13px', fontWeight: 600 }}>
               {context.app}
             </span>
             <span style={{ color: c.textMuted, fontSize: '13px' }}>
               {context.session_minutes}m
             </span>
             <span style={{ color: c.accent, fontSize: '13px', fontWeight: 600 }}>
               Focus: {context.focus_score}/100
             </span>
           </div>
        )}
      </div>

      {/* Question */}
      <div style={{ color: c.text, fontSize: '15px', marginBottom: '16px', fontWeight: 600 }}>
        {questionMsg}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleTakeMeBack} style={{
          flex: 1, padding: '12px', background: c.primary,
          color: '#fff', border: 'none', borderRadius: '10px',
          cursor: 'pointer', fontSize: '14px', fontWeight: 600,
          transition: 'background 0.2s',
        }}
        >
          {yesBtn}
        </button>

        <button onClick={handleStayHere} style={{
          flex: 1, padding: '12px', background: c.bg,
          color: c.text, border: `1px solid ${c.border}`,
          borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
          transition: 'border-color 0.2s',
        }}
        >
          ✓ Stay here
        </button>

        <button onClick={handleSnooze} style={{
          padding: '12px 14px', background: c.bg,
          color: c.text, border: `1px solid ${c.border}`,
          borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
          transition: 'border-color 0.2s',
        }}
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
