import React, { useState, useEffect } from 'react';

// Productivity.jsx
// Shows productivity score per person
// Personal: just yourself
// Teams: all team members basic
// WorkSense: full matrix with tips trends and actions

const Productivity = () => {
  const [matrix, setMatrix]   = useState(null)
  const [loading, setLoading] = useState(true)
  const plan = localStorage.getItem('cos_plan') || 'personal'

  useEffect(() => {
    fetch('/worksense/manager/productivity-matrix', {
      headers: { Authorization: `Bearer ${localStorage.getItem('cos_token')}` }
    })
    .then(r => r.json())
    .then(d => { setMatrix(d); setLoading(false) })
    .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={styles.loading}>Loading matrix...</div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.label}>PRODUCTIVITY MATRIX</span>
        <h2 style={styles.title}>
          {plan === 'personal'   ? 'Your Productivity Score'  : ''}
          {plan === 'teams'      ? 'Team Productivity Overview': ''}
          {plan === 'worksense'  ? 'Full Productivity Matrix'  : ''}
        </h2>
      </div>

      {matrix?.employees?.map(emp => (
        <div key={emp.emp_code} style={styles.matrixRow}>

          {/* Header row */}
          <div style={styles.matrixHeader}>
            <span style={styles.empName}>
              {emp.name || emp.emp_code}
            </span>
            <span style={{
              ...styles.score,
              color: emp.score_class === 'green'  ? '#22c55e' :
                     emp.score_class === 'yellow' ? '#eab308' : '#ef4444'
            }}>
              {emp.productivity_score}/100
            </span>
          </div>

          {/* Progress bar */}
          <div style={styles.barBg}>
            <div style={{
              ...styles.barFill,
              width: `${emp.productivity_score}%`,
              background: emp.score_class === 'green'  ? '#22c55e' :
                          emp.score_class === 'yellow' ? '#eab308' : '#ef4444'
            }}/>
          </div>

          {/* Metrics row — Teams + WorkSense only */}
          {plan !== 'personal' && (
            <div style={styles.metricsRow}>
              <span style={styles.metric}>
                Focus: {emp.metrics?.avg_focus_score}
              </span>
              <span style={styles.metric}>
                Switches: {emp.metrics?.avg_context_switches}/day
              </span>
              <span style={styles.metric}>
                Idle: {emp.metrics?.idle_percentage}%
              </span>
              <span style={styles.metric}>
                Session: {emp.metrics?.avg_session_minutes}m
              </span>
            </div>
          )}

          {/* Improvement tip — WorkSense only */}
          {plan === 'worksense' && (
            <div style={styles.tip}>
              💡 {emp.improvement_tip}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const styles = {
  page:        { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  header:      { marginBottom: '32px' },
  label:       { fontSize: '11px', color: '#6366f1',
                 letterSpacing: '0.1em', fontWeight: 600 },
  title:       { fontSize: '28px', color: '#fff',
                 fontWeight: 600, marginTop: '8px' },
  loading:     { color: '#a1a1aa', padding: '40px', textAlign: 'center' },
  matrixRow:   { background: '#111', borderRadius: '12px',
                 padding: '20px 24px', marginBottom: '12px' },
  matrixHeader:{ display: 'flex', justifyContent: 'space-between',
                 marginBottom: '12px' },
  empName:     { fontSize: '15px', fontWeight: 600, color: '#fff' },
  score:       { fontSize: '15px', fontWeight: 700 },
  barBg:       { height: '8px', background: '#2a2a2a',
                 borderRadius: '4px', overflow: 'hidden',
                 marginBottom: '12px' },
  barFill:     { height: '100%', borderRadius: '4px',
                 transition: 'width 0.8s ease' },
  metricsRow:  { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  metric:      { fontSize: '12px', color: '#a1a1aa' },
  tip:         { fontSize: '13px', color: '#a1a1aa',
                 marginTop: '10px', padding: '10px 12px',
                 background: '#1a1a1a', borderRadius: '8px',
                 borderLeft: '3px solid #6366f1' }
}

export default Productivity
