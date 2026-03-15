import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = ''

export default function OrgSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [company, setCompany] = useState('')
  const [yourName, setYourName] = useState('')
  const [teamSize, setTeamSize] = useState(10)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [credentials, setCredentials] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/org/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_name: company,
          manager_email: email,
          manager_password: password,
          team_size: Math.min(100, Math.max(2, teamSize)),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Create failed')
      setCredentials(data)
      setStep(3)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const copyRow = (code, pw) => {
    navigator.clipboard.writeText(`${code}\t${pw}`)
  }

  const downloadCSV = () => {
    if (!credentials?.employees) return
    const rows = credentials.employees.map(e => `${e.emp_code},${e.temp_password}`)
    const csv = 'Employee Code,Temp Password\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `worksense-${credentials.org_code}-credentials.csv`
    a.click()
  }

  const emailTemplate = credentials?.employees?.[0]
    ? `Hi team,\nInstall COS WorkSense from [link]\nYour login credentials:\nCode: ${credentials.employees[0].emp_code}\nPassword: ${credentials.employees[0].temp_password}\n— ${yourName}`
    : ''

  const copyEmailTemplate = () => {
    navigator.clipboard.writeText(emailTemplate)
  }

  const goDashboard = () => {
    if (credentials?.manager_token) {
      localStorage.setItem('ws_manager_token', credentials.manager_token)
      localStorage.setItem('ws_org_name', credentials.org_code)
      navigate('/dashboard')
    }
  }

  const styles = { wrap: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: 40 }, card: { background: '#111', border: '1px solid #1f2937', borderRadius: 12, padding: 24, maxWidth: 480 }, input: { width: '100%', padding: 12, background: '#0f0f0f', border: '1px solid #1f2937', borderRadius: 8, color: '#fff' }, btn: { padding: '12px 24px', background: '#14b8a6', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 } }

  if (credentials && step >= 3) {
    return (
      <div style={styles.wrap}>
        <h2 style={{ marginBottom: 8 }}>Share these with your team</h2>
        <p style={{ color: '#9ca3af', marginBottom: 24 }}>Step 3 — Employee credentials</p>
        <div style={{ ...styles.card, overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1f2937' }}><th style={{ padding: 12, textAlign: 'left' }}>Employee Code</th><th style={{ padding: 12, textAlign: 'left' }}>Temp Password</th><th style={{ padding: 12 }}></th></tr></thead>
            <tbody>
              {credentials.employees?.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: 12 }}>{e.emp_code}</td>
                  <td style={{ padding: 12 }}>{e.temp_password}</td>
                  <td style={{ padding: 12 }}><button type="button" onClick={() => copyRow(e.emp_code, e.temp_password)} style={{ padding: '6px 12px', background: '#14b8a6', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>Copy</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button type="button" onClick={downloadCSV} style={{ padding: '10px 20px', background: '#1f2937', color: '#fff', border: '1px solid #1f2937', borderRadius: 10, cursor: 'pointer' }}>📥 Download CSV</button>
          <button type="button" onClick={copyEmailTemplate} style={{ padding: '10px 20px', background: '#1f2937', color: '#fff', border: '1px solid #1f2937', borderRadius: 10, cursor: 'pointer' }}>📋 Copy Email Template</button>
          <button type="button" onClick={goDashboard} style={styles.btn}>→ Go to Dashboard</button>
        </div>
        <div style={{ marginTop: 48 }}>
          <h3 style={{ marginBottom: 12 }}>Step 4 — Install guide</h3>
          <p style={{ color: '#9ca3af', marginBottom: 8 }}>Send to each employee:</p>
          <ol style={{ color: '#9ca3af', paddingLeft: 20, marginBottom: 24 }}>
            <li>Install COS WorkSense extension from Chrome</li>
            <li>Log in with your code + password</li>
            <li>COS runs silently — you are always informed what is visible</li>
          </ol>
          <button type="button" onClick={goDashboard} style={styles.btn}>→ Open Dashboard</button>
        </div>
      </div>
    )
  }

  const handleEmployeeLogin = async (e) => {
    e.preventDefault()
    const code = (e.target.emp_code?.value || '').trim()
    const pw = (e.target.temp_password?.value || '').trim()
    if (!code || !pw) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_code: code, temp_password: pw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      localStorage.setItem('ws_emp_token', data.emp_token)
      localStorage.setItem('ws_org_name', data.org_name || '')
      localStorage.setItem('ws_emp_code', code)
      localStorage.setItem('ws_emp_name', data.emp_id || 'Employee')
      navigate('/home')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleManagerLogin = async (e) => {
    e.preventDefault()
    const email = (e.target.manager_email?.value || '').trim()
    const pw = (e.target.manager_password?.value || '').trim()
    if (!email || !pw) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_email: email, manager_password: pw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      localStorage.setItem('ws_manager_token', data.manager_token)
      localStorage.setItem('ws_org_name', data.org_name || '')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={styles.wrap}>
      <h1 style={{ marginBottom: 24, fontSize: 24 }}>🏢 COS WorkSense Setup</h1>
      <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
      {step === 1 && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: 16 }}>Step 1 — Company info</h2>
          <form onSubmit={() => setStep(2)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#9ca3af', fontSize: 13 }}>Company name</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} required style={styles.input} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#9ca3af', fontSize: 13 }}>Your name</label>
              <input type="text" value={yourName} onChange={e => setYourName(e.target.value)} required style={styles.input} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#9ca3af', fontSize: 13 }}>Team size (2–100)</label>
              <input type="range" min={2} max={100} value={teamSize} onChange={e => setTeamSize(Number(e.target.value))} style={{ width: '100%' }} />
              <span style={{ color: '#14b8a6' }}>{teamSize}</span>
            </div>
            <button type="submit" style={styles.btn}>→ Next</button>
          </form>
        </div>
      )}
      {step === 2 && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: 16 }}>Step 2 — Manager account</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#9ca3af', fontSize: 13 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={styles.input} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#9ca3af', fontSize: 13 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#9ca3af', fontSize: 13 }}>Confirm password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={styles.input} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 14 }}>{error}</p>}
            <button type="submit" disabled={loading} style={styles.btn}>{loading ? 'Setting up your organization...' : '→ Create Organization'}</button>
          </form>
        </div>
      )}
      {step === 1 && (
      <div style={{ ...styles.card, minWidth: 320 }}>
        <h2 style={{ marginBottom: 16 }}>Sign in</h2>
        <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>Manager</p>
        <form onSubmit={handleManagerLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <input name="manager_email" type="email" placeholder="Manager email" required style={styles.input} />
          <input name="manager_password" type="password" placeholder="Password" required style={styles.input} />
          <button type="submit" disabled={loading} style={{ ...styles.btn, background: '#1f2937', color: '#14b8a6' }}>Manager login</button>
        </form>
        <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 12 }}>Employee</p>
        <form onSubmit={handleEmployeeLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input name="emp_code" type="text" placeholder="Employee code (e.g. EMP001-ORG-2026)" required style={styles.input} />
          <input name="temp_password" type="password" placeholder="Temp password" required style={styles.input} />
          <button type="submit" disabled={loading} style={{ ...styles.btn, background: '#1f2937', color: '#14b8a6' }}>Employee login</button>
        </form>
        {error && <p style={{ color: '#ef4444', fontSize: 14, marginTop: 12 }}>{error}</p>}
      </div>
      )}
      </div>
    </div>
  )
}
