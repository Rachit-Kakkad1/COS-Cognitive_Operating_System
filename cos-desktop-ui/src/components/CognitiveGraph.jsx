import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

export default function CognitiveGraph() {
  const [graph, setGraph] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/graph`)
      .then(r => r.json())
      .then(data => { setGraph(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'rgba(240,235,204,0.3)', fontSize: 13 }}>
      Loading graph…
    </div>
  )

  if (!graph || graph.nodes?.length === 0) return (
    <div style={{
      background: 'rgba(4,0,154,0.12)', border: '1px solid rgba(62,219,240,0.1)',
      borderRadius: 16, padding: '32px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🔗</div>
      <p style={{ color: 'rgba(240,235,204,0.4)', fontSize: 13 }}>No memory graph yet</p>
    </div>
  )

  const nodeCount = graph.nodes?.length || 0
  const edgeCount = graph.edges?.length || 0

  // Group nodes by app
  const apps = {}
  graph.nodes.forEach(n => {
    const a = n.app || 'Unknown'
    apps[a] = (apps[a] || 0) + 1
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: 'Nodes', value: nodeCount, color: '#3EDBF0' },
          { label: 'Edges', value: edgeCount, color: '#77ACF1' },
          { label: 'Apps',  value: Object.keys(apps).length, color: '#F0EBCC' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'rgba(4,0,154,0.15)',
            border: `1px solid ${s.color}22`,
            borderRadius: 12, padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(240,235,204,0.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* App breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(apps).slice(0, 8).map(([app, count], i) => {
          const pct = Math.round((count / nodeCount) * 100)
          return (
            <div key={app} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              animation: `fadeSlideUp 0.3s ease-out both`,
              animationDelay: `${i * 0.05}s`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#3EDBF0', flexShrink: 0,
                boxShadow: '0 0 6px #3EDBF0',
              }} />
              <span style={{ color: 'var(--cream)', fontSize: 12, flex: 1, fontWeight: 500 }}>{app}</span>
              <div style={{ width: 80, height: 3, background: 'rgba(119,172,241,0.12)', borderRadius: 2 }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: 'linear-gradient(90deg,#3EDBF0,#77ACF1)',
                  borderRadius: 2,
                }} />
              </div>
              <span style={{ color: 'rgba(240,235,204,0.35)', fontSize: 11, width: 28, textAlign: 'right' }}>
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
