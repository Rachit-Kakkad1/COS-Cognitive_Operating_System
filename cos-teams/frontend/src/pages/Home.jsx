import { useState, useEffect, useRef } from 'react'

const API = ''
const ACCENT = '#f59e0b'

export default function Home() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState(null)
  const token = localStorage.getItem('cos_teams_member_token')
  const teamName = localStorage.getItem('cos_teams_team_name') || ''

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.json()).then(setHealth).catch(() => {})
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim() || !token) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${API}/recall?query=${encodeURIComponent(query)}&k=5`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setResult(data.results?.[0] || { summary: 'No relevant memory.', app: '', timestamp: '' })
    } catch {
      setResult({ summary: 'API unreachable.', app: '', timestamp: '' })
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Workspace</h1>
      <p style={{ color: '#a1a1aa', marginBottom: 24 }}>Recall what you were thinking.</p>
      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What was I working on?"
          style={{ width: '100%', maxWidth: 400, padding: 14, background: '#1a1a1a', border: `1px solid #2a2a2a`, borderRadius: 10, color: '#fff', fontSize: 15 }}
        />
        <button type="submit" disabled={loading} style={{ marginLeft: 12, padding: '14px 20px', background: ACCENT, color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Recall</button>
      </form>
      {result && (
        <div style={{ background: '#1a1a1a', border: `1px solid ${ACCENT}40`, borderRadius: 12, padding: 20 }}>
          <div style={{ color: ACCENT, fontSize: 12, marginBottom: 8 }}>{result.app} · {result.timestamp}</div>
          <div style={{ color: '#fff', fontSize: 16 }}>{result.summary}</div>
        </div>
      )}
      {health && <p style={{ color: '#a1a1aa', fontSize: 12, marginTop: 24 }}>Backend: {health.version}</p>}
    </div>
  )
}
