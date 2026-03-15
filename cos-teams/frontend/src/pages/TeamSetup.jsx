import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = ''

export default function TeamSetup() {
  const navigate = useNavigate()
  const [create, setCreate] = useState({ team_name: '', founder_email: '', founder_password: '', team_size: 5 })
  const [join, setJoin] = useState({ member_code: '', temp_password: '' })
  const [credentials, setCredentials] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/team/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(create),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Create failed')
      setCredentials(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/team/auth/member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(join),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Join failed')
      localStorage.setItem('cos_teams_member_token', data.member_token)
      localStorage.setItem('cos_teams_team_name', data.team_name)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const goDashboard = () => {
    if (credentials?.founder_token) {
      localStorage.setItem('cos_teams_founder_token', credentials.founder_token)
      localStorage.setItem('cos_teams_team_name', credentials.team_name || credentials.team_code)
      navigate('/team')
    }
  }

  const copyCred = (code, pw) => {
    navigator.clipboard.writeText(`${code}\t${pw}`)
  }

  const downloadCSV = () => {
    if (!credentials?.members) return
    const rows = credentials.members.map(m => `${m.code},${m.temp_password}`)
    const csv = 'Member Code,Temp Password\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cos-teams-${credentials.team_code}-credentials.csv`
    a.click()
  }

  if (credentials) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: 40 }}>
        <h2 style={{ marginBottom: 24, fontSize: 22 }}>Team created: {credentials.team_code}</h2>
        <p style={{ color: '#a1a1aa', marginBottom: 24 }}>Share these credentials with your members.</p>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Member Code</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Temp Password</th>
                <th style={{ padding: 12 }}></th>
              </tr>
            </thead>
            <tbody>
              {credentials.members?.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: 12 }}>{m.code}</td>
                  <td style={{ padding: 12 }}>{m.temp_password}</td>
                  <td style={{ padding: 12 }}>
                    <button type="button" onClick={() => copyCred(m.code, m.temp_password)} style={{ padding: '6px 12px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>Copy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={downloadCSV} style={{ marginRight: 12, padding: '10px 20px', background: '#2a2a2a', color: '#fff', border: '1px solid #2a2a2a', borderRadius: 10, cursor: 'pointer' }}>Download CSV</button>
        <button type="button" onClick={goDashboard} style={{ padding: '10px 20px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>→ Go to Dashboard</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: 40, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 320px', maxWidth: 420 }}>
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>🚀 Create a Team</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#a1a1aa', fontSize: 13 }}>Team name</label>
            <input type="text" value={create.team_name} onChange={e => setCreate(c => ({ ...c, team_name: e.target.value }))} required style={{ width: '100%', padding: 12, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#a1a1aa', fontSize: 13 }}>Your email</label>
            <input type="email" value={create.founder_email} onChange={e => setCreate(c => ({ ...c, founder_email: e.target.value }))} required style={{ width: '100%', padding: 12, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#a1a1aa', fontSize: 13 }}>Password</label>
            <input type="password" value={create.founder_password} onChange={e => setCreate(c => ({ ...c, founder_password: e.target.value }))} required style={{ width: '100%', padding: 12, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#a1a1aa', fontSize: 13 }}>Team size: {create.team_size}</label>
            <input type="range" min={2} max={10} value={create.team_size} onChange={e => setCreate(c => ({ ...c, team_size: +e.target.value }))} style={{ width: '100%', accentColor: '#f59e0b' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: 14, background: '#f59e0b', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>→ Create Team</button>
        </form>
      </div>
      <div style={{ flex: '1 1 320px', maxWidth: 420 }}>
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>👥 Join a Team</h2>
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#a1a1aa', fontSize: 13 }}>Member code</label>
            <input type="text" placeholder="MEM001-HACK" value={join.member_code} onChange={e => setJoin(j => ({ ...j, member_code: e.target.value }))} required style={{ width: '100%', padding: 12, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#a1a1aa', fontSize: 13 }}>Password</label>
            <input type="password" value={join.temp_password} onChange={e => setJoin(j => ({ ...j, temp_password: e.target.value }))} required style={{ width: '100%', padding: 12, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: 14, background: '#f59e0b', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>→ Join Team</button>
        </form>
      </div>
      {error && <p style={{ color: '#ef4444', width: '100%', textAlign: 'center' }}>{error}</p>}
    </div>
  )
}
