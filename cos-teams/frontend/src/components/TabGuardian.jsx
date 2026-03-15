import { useState, useEffect } from 'react'

const API = ''
const ACCENT = '#f59e0b'

export default function TabGuardian() {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(8)
  const token = localStorage.getItem('cos_teams_member_token')
  const [currentApp, setCurrentApp] = useState('Browser')
  const [currentTitle, setCurrentTitle] = useState(typeof document !== 'undefined' ? document.title : '')
  const sessionStart = useState(Date.now())[0]

  useEffect(() => {
    if (typeof document === 'undefined') return
    const t = setInterval(() => setCurrentTitle(document.title), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!token) return
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const sessionMinutes = Math.round((Date.now() - sessionStart) / 60000)
        try {
          await fetch(`${API}/team/snapshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              app: currentApp,
              title: currentTitle,
              text: '',
              timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
              focus_score: 75,
              context_switches: 0,
            }),
          })
        } catch (e) {
          console.log('[TabGuardian] Snapshot failed', e.message)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [token, currentApp, currentTitle, sessionStart])

  useEffect(() => {
    if (!visible) return
    if (countdown <= 0) { setVisible(false); return }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [visible, countdown])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 320,
      background: '#1a1a1a',
      border: `1px solid ${ACCENT}`,
      borderRadius: 12,
      padding: 20,
      zIndex: 9999,
      boxShadow: `0 0 20px ${ACCENT}40`,
    }}>
      <div style={{ color: ACCENT, fontWeight: 600, marginBottom: 8 }}>COS Teams · Tab switch</div>
      <p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 12 }}>You left: {currentTitle || currentApp}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setVisible(false)} style={{ padding: '8px 16px', background: ACCENT, color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>Back to work</button>
        <button onClick={() => setVisible(false)} style={{ padding: '8px 16px', background: 'transparent', color: '#a1a1aa', border: '1px solid #2a2a2a', borderRadius: 8, cursor: 'pointer' }}>Stay</button>
      </div>
    </div>
  )
}
