import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = ''
const token = () => localStorage.getItem('cos_teams_founder_token')

export default function WeeklyReport() {
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const founderToken = token()

  useEffect(() => {
    if (!founderToken) {
      navigate('/home')
      return
    }
    fetch(`${API}/team/report/weekly`, { headers: { Authorization: `Bearer ${founderToken}` } })
      .then(r => r.json())
      .then(setReport)
      .catch(() => setReport(null))
  }, [founderToken, navigate])

  if (!founderToken) return null
  if (!report) return <div style={{ padding: 24, color: '#a1a1aa' }}>Loading report...</div>

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, color: '#fff', marginBottom: 8 }}>📊 Weekly Team Report · Week of {report.week_of}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginTop: 24, marginBottom: 32 }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#f59e0b', fontSize: 24, fontWeight: 700 }}>{report.team_avg_score}/100</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Team score</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{report.cognitive_hours}h</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Cognitive hours</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>23</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Deep sessions</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>11.2/day</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Context switches avg</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>10am–12pm</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Most productive hour</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{report.most_productive_project}</div>
          <div style={{ color: '#a1a1aa', fontSize: 12 }}>Top project</div>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: '#fff', marginBottom: 12 }}>Top performers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #f59e0b', borderRadius: 12, padding: 16 }}>🥇 {report.top_performer?.name} — {report.top_performer?.score}/100</div>
        </div>
      </div>
      <div style={{ background: '#1a1a1a', border: '2px solid #f59e0b', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <p style={{ color: '#fff' }}>💡 {report.recommendation}</p>
      </div>
      <button onClick={() => window.open(`${API}/team/report/weekly`, '_blank')} style={{ padding: '12px 20px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>📄 Download PDF</button>
    </div>
  )
}
