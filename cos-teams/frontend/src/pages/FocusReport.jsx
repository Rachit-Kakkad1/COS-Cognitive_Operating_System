import { useState, useEffect } from 'react'

const API = ''
const token = () => localStorage.getItem('cos_teams_member_token')

export default function FocusReport() {
  const [members, setMembers] = useState([])

  useEffect(() => {
    const t = token()
    if (!t) return
    fetch(`${API}/team/members`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(d => setMembers(d.members || []))
      .catch(() => setMembers([]))
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, color: '#fff', marginBottom: 24 }}>Focus</h2>
      <p style={{ color: '#a1a1aa', marginBottom: 16 }}>Team focus snapshot. (Founder view shows all members.)</p>
      {members.length === 0 ? <p style={{ color: '#a1a1aa' }}>No data yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {members.map(m => (
            <div key={m.member_id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
              <div style={{ color: '#fff' }}>{m.name || m.member_code}</div>
              <div style={{ color: '#a1a1aa', fontSize: 13 }}>{m.current_app} — {m.current_title}</div>
              <div style={{ marginTop: 8, color: m.status === 'focused' ? '#22c55e' : m.status === 'distracted' ? '#eab308' : '#a1a1aa' }}>Focus: {m.focus_score}/100 · {m.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
