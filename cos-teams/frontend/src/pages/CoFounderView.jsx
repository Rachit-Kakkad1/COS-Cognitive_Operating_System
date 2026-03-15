import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API = ''
const token = () => localStorage.getItem('cos_teams_founder_token')

export default function CoFounderView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = token()
    if (!t || !id) return
    fetch(`${API}/team/cofounder-view/${id}`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 24, color: '#a1a1aa' }}>Loading...</div>
  if (!data) return <div style={{ padding: 24, color: '#a1a1aa' }}>Not found.</div>

  return (
    <div style={{ padding: 24, maxWidth: 560 }}>
      <h2 style={{ fontSize: 22, color: '#fff', marginBottom: 8 }}>What is {data.name} thinking right now?</h2>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24 }}>
        <div style={{ color: '#a1a1aa', marginBottom: 16 }}>👤 {data.name} · {data.member_code}</div>
        <div style={{ color: '#a1a1aa', marginBottom: 20 }}>Last active: {data.last_active}</div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 6 }}>Current thread</div>
          <div style={{ color: '#fff', fontSize: 16 }}>{data.current_thread}</div>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>{data.current_app} · {data.session_minutes} min · Focus: {data.focus_score}/100</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 6 }}>Unfinished threads</div>
          <ul style={{ paddingLeft: 20, color: '#fff' }}>{data.unfinished_threads?.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 6 }}>Most connected memory</div>
          <div style={{ color: '#fff' }}>{data.most_connected_memory || '—'}</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/handoff?send=true')} style={{ padding: '12px 20px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>🤝 Start Handoff</button>
          <button onClick={() => navigate(-1)} style={{ padding: '12px 20px', background: 'transparent', color: '#a1a1aa', border: '1px solid #2a2a2a', borderRadius: 10, cursor: 'pointer' }}>← Back</button>
        </div>
      </div>
    </div>
  )
}
