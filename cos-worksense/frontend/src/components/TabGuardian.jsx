import { useState, useEffect, useRef } from 'react'

const API = ''
const WS_BASE = typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}` : ''

export default function TabGuardian() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState(null)
  const [countdown, setCountdown] = useState(8)
  const [alertType, setAlertType] = useState(null)
  const wsRef = useRef(null)
  const timerRef = useRef(null)
  const token = localStorage.getItem('ws_emp_token')

  useEffect(() => {
    if (!token) return
    const ws = new WebSocket(`${WS_BASE}/guardian/ws`)
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'app_switch') {
          setMessage(msg)
          setAlertType(msg.alert_type || null)
          setVisible(true)
          setCountdown(msg.alert_type === 'cpu_spike' ? 15 : 8)
        }
      } catch (_) {}
    }
    wsRef.current = ws
    return () => ws.close()
  }, [token])

  useEffect(() => {
    if (!visible) return
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { setVisible(false); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [visible])

  const handleReturn = () => {
    if (message?.switch_id && token) {
      fetch(`${API}/employee/tab-switch/returned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ switch_id: message.switch_id, returned: true }),
      }).catch(() => {})
    }
    setVisible(false)
  }

  const handleStay = () => {
    if (message?.switch_id && token) {
      fetch(`${API}/employee/tab-switch/returned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ switch_id: message.switch_id, returned: false }),
      }).catch(() => {})
    }
    setVisible(false)
  }

  if (!visible || !message) return null

  const isCpu = alertType === 'cpu_spike'

  return (
    <div style={{
      position: 'fixed', bottom: 100, right: 24, width: 380, zIndex: 9999,
      background: '#111', border: '1px solid #1f2937', borderRadius: 12,
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden',
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{ padding: 16, borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>{isCpu ? '⚠️ High CPU Alert' : '🏢 COS WorkSense — Context Alert'}</span>
        <span style={{ color: '#9ca3af', fontSize: 12 }}>× {countdown}s</span>
      </div>
      <div style={{ padding: 16 }}>
        {isCpu ? (
          <p style={{ margin: 0, color: '#e5e5e5' }}>{message.from_app || 'Process'} is using {message.cpu_percent ?? message.value ?? 0}% CPU</p>
        ) : (
          <>
            <p style={{ color: '#9ca3af', marginBottom: 8 }}>You were working on:</p>
            <p style={{ fontWeight: 500, marginBottom: 8 }}>"{message.from_title}" in {message.from_app}</p>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Focus: {message.from_focus_score ?? '—'}/100 · {message.from_session_minutes ?? 0} min</p>
            <p style={{ marginTop: 12, color: '#e5e5e5' }}>Would you like to go back?</p>
          </>
        )}
      </div>
      <div style={{ padding: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {isCpu ? (
          <>
            <button type="button" onClick={() => setVisible(false)} style={{ padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🗑️ Kill Process</button>
            <button type="button" onClick={handleStay} style={{ padding: '10px 16px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>✓ Ignore</button>
          </>
        ) : (
          <>
            <button type="button" onClick={handleReturn} style={{ padding: '10px 16px', background: '#14b8a6', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>↩ Take me back</button>
            <button type="button" onClick={handleStay} style={{ padding: '10px 16px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>✓ Stay here</button>
            <button type="button" style={{ padding: '10px 16px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>⏰ 5m</button>
          </>
        )}
      </div>
    </div>
  )
}
