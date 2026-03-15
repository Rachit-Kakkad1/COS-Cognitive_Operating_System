import { useState, useEffect } from 'react'

const API = ''

export default function TeamBanner() {
  const [info, setInfo] = useState({ team_name: '', count: 0 })
  const token = localStorage.getItem('cos_teams_founder_token') || localStorage.getItem('cos_teams_member_token')
  const teamName = localStorage.getItem('cos_teams_team_name') || 'COS Teams'

  useEffect(() => {
    if (!token) return
    const isFounder = !!localStorage.getItem('cos_teams_founder_token')
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${API}/team/members`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setInfo({ team_name: teamName, count: data.members?.length || 0 })
        } else {
          setInfo({ team_name: teamName, count: isFounder ? 0 : null })
        }
      } catch {
        setInfo({ team_name: teamName, count: isFounder ? 0 : null })
      }
    }
    if (isFounder) {
      fetchMembers()
      const t = setInterval(fetchMembers, 30000)
      return () => clearInterval(t)
    } else {
      setInfo({ team_name: teamName, count: null })
    }
  }, [token, teamName])

  if (!token) return null

  return (
    <div style={{
      height: 36,
      background: '#0a0f1e',
      borderLeft: '3px solid #f59e0b',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 16,
      fontSize: 13,
      color: '#a1a1aa',
    }}>
      ⚡ COS Teams · {info.team_name || teamName}{info.count != null ? ` · ${info.count} members active` : ''} · 🟢 Connected
    </div>
  )
}
