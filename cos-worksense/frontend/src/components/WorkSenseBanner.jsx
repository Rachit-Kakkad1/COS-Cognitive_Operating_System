import { useState, useEffect } from 'react'

const API = ''

export default function WorkSenseBanner() {
  const [orgName, setOrgName] = useState('')
  const [count, setCount] = useState(0)
  const [live, setLive] = useState(true)
  const isManager = !!localStorage.getItem('ws_manager_token')
  const isEmployee = !!localStorage.getItem('ws_emp_token')

  useEffect(() => {
    if (!isManager && !isEmployee) return
    const token = isManager ? localStorage.getItem('ws_manager_token') : localStorage.getItem('ws_emp_token')
    const role = isManager ? 'manager' : 'employee'
    if (isManager) {
      fetch(`${API}/manager/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { setOrgName(d.org_name || ''); setCount(d.total_online ?? 0) })
        .catch(() => {})
    } else {
      setOrgName(localStorage.getItem('ws_org_name') || '')
    }
  }, [isManager, isEmployee])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 40, zIndex: 1000,
      background: '#0a0f1e', borderLeft: '3px solid #14b8a6',
      display: 'flex', alignItems: 'center', paddingLeft: 16, gap: 12,
      fontSize: 13, color: '#9ca3af',
    }}>
      <span>🏢 {orgName || 'WorkSense'} · WorkSense Active</span>
      {isManager && <span>· {count} employees</span>}
      <span style={{ color: live ? '#22c55e' : '#9ca3af' }}>· 🟢 Live</span>
      <span style={{ marginLeft: 'auto', paddingRight: 16 }}>
        {isManager ? 'Manager View' : 'Employee Mode · Monitored'}
      </span>
    </div>
  )
}
