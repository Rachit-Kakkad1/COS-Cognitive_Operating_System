import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = ''
const ACCENT = '#f59e0b'

function FocusBar({ score }) {
  const filled = Math.min(5, Math.round((score / 100) * 5))
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ width: 8, height: 14, background: i <= filled ? ACCENT : '#2a2a2a', borderRadius: 2 }} />
      ))}
    </span>
  )
}

export default function TeamDashboard() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [teamName, setTeamName] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const founderToken = localStorage.getItem('cos_teams_founder_token')

  useEffect(() => {
    if (!founderToken) {
      navigate('/home')
      return
    }
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${API}/team/members`, { headers: { Authorization: `Bearer ${founderToken}` } })
        const data = await res.json()
        setMembers(data.members || [])
        setLastUpdated(new Date())
      } catch (e) {
        console.error(e)
      }
    }
    fetchMembers()
    const t = setInterval(fetchMembers, 5000)
    return () => clearInterval(t)
  }, [founderToken, navigate])

  const avg = members.length ? Math.round(members.reduce((a, m) => a + (m.focus_score || 0), 0) / members.length) : 0
  const focused = members.filter(m => m.status === 'focused').length
  const distracted = members.filter(m => m.status === 'distracted').length
  const idle = members.filter(m => m.status === 'idle').length

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, color: '#fff', marginBottom: 8 }}>⚡ Team Dashboard — {teamName || localStorage.getItem('cos_teams_team_name') || 'Team'}</h1>
      <p style={{ color: '#a1a1aa', marginBottom: 24 }}>{members.length} members · Team score: {avg}/100 · Last updated: {lastUpdated ? `${Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago` : '—'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: ACCENT, fontSize: 28, fontWeight: 700 }}>{avg}</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Team Score</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: '#22c55e', fontSize: 28, fontWeight: 700 }}>{focused}</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Focused</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: '#eab308', fontSize: 28, fontWeight: 700 }}>{distracted}</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Distracted</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: '#a1a1aa', fontSize: 28, fontWeight: 700 }}>{idle}</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Idle</div>
        </div>
      </div>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Member</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Current Context</th>
              <th style={{ padding: 12 }}>Focus</th>
              <th style={{ padding: 12 }}>Switches</th>
              <th style={{ padding: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.member_id} style={{ borderBottom: '1px solid #2a2a2a', cursor: 'pointer' }} onClick={() => navigate(`/cofounder/${m.member_id}`)}>
                <td style={{ padding: 12 }}>{m.name || m.member_code}</td>
                <td style={{ padding: 12 }}>{m.current_app} — {m.current_title}</td>
                <td style={{ padding: 12 }}><FocusBar score={m.focus_score || 0} /> {m.focus_score ?? 0}</td>
                <td style={{ padding: 12 }}>{m.context_switches ?? 0}</td>
                <td style={{ padding: 12 }}>{m.status === 'focused' ? '🟢 Focused' : m.status === 'distracted' ? '🔴 Off task' : '⚪ Idle'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
