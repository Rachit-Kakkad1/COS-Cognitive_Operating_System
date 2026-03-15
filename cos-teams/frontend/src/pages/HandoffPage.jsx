import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const API = ''
const token = () => localStorage.getItem('cos_teams_member_token')

export default function HandoffPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sendMode = searchParams.get('send') === 'true'
  const receiveMode = searchParams.get('receive') === 'true' || !sendMode
  const [sendData, setSendData] = useState(null)
  const [receiveData, setReceiveData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    if (sendMode && token()) {
      setLoading(true)
      fetch(`${API}/handoff/generate`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` } })
        .then(r => r.json())
        .then(data => {
          setSendData(data)
          setLoading(false)
          if (data.expires_at) {
            const end = new Date(data.expires_at).getTime()
            const tick = () => {
              const left = Math.max(0, Math.floor((end - Date.now()) / 1000))
              setCountdown(left)
              if (left > 0) setTimeout(tick, 1000)
            }
            tick()
          }
        })
        .catch(() => setLoading(false))
    }
  }, [sendMode])

  const handleReceive = (handoffId) => {
    const t = token()
    if (!t || !handoffId) return
    setLoading(true)
    fetch(`${API}/handoff/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ handoff_id: handoffId }),
    })
      .then(r => r.json())
      .then(data => { setReceiveData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const fmt = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      {sendMode && (
        <>
          <h2 style={{ fontSize: 22, color: '#fff', marginBottom: 24 }}>🤝 Share Your Thinking</h2>
          {loading && !sendData && <p style={{ color: '#a1a1aa' }}>Generating QR...</p>}
          {sendData && (
            <>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 8 }}>Transferring:</div>
                <div style={{ color: '#fff' }}>{sendData.context_summary}</div>
                <div style={{ color: '#a1a1aa', fontSize: 13 }}>{sendData.memories_count} memories</div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <img src={sendData.qr_base64} alt="Handoff QR" width={240} height={240} style={{ borderRadius: 12 }} />
              </div>
              {countdown != null && <p style={{ color: '#f59e0b', marginBottom: 16 }}>Expires in {fmt(countdown)}</p>}
              <p style={{ color: '#a1a1aa', fontSize: 13 }}>Waiting for someone to scan...</p>
            </>
          )}
        </>
      )}
      {receiveMode && !sendMode && (
        <>
          <h2 style={{ fontSize: 22, color: '#fff', marginBottom: 24 }}>📥 Receive Handoff</h2>
          {loading && !receiveData && <p style={{ color: '#a1a1aa' }}>Importing cognitive context...</p>}
          {receiveData && (
            <div style={{ background: '#1a1a1a', border: '1px solid #14b8a6', borderRadius: 12, padding: 24 }}>
              <h3 style={{ color: '#22c55e', marginBottom: 16 }}>✅ Handoff Complete</h3>
              <p style={{ color: '#fff' }}>{receiveData.memories_imported} memories imported</p>
              <p style={{ color: '#fff' }}>{receiveData.graph_edges_built} connections built</p>
              <p style={{ color: '#a1a1aa' }}>From: {receiveData.from_member}</p>
              <p style={{ color: '#a1a1aa', marginTop: 12 }}>Suggested first action: {receiveData.suggested_first_action}</p>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button onClick={() => navigate('/home')} style={{ padding: '12px 20px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>✓ Accept & Start Working</button>
                <button onClick={() => navigate('/timeline')} style={{ padding: '12px 20px', background: 'transparent', color: '#a1a1aa', border: '1px solid #2a2a2a', borderRadius: 10, cursor: 'pointer' }}>👁 Preview First</button>
              </div>
            </div>
          )}
          {!receiveData && !loading && (
            <p style={{ color: '#a1a1aa' }}>Scan a handoff QR or open a handoff link to import context.</p>
          )}
        </>
      )}
    </div>
  )
}
