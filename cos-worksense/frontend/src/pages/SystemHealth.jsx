import { useState, useEffect } from 'react'

const API = ''

export default function SystemHealth() {
  const [report, setReport] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(0)
  const [killModal, setKillModal] = useState(null)

  const fetchReport = () => {
    fetch(`${API}/system/power-report`)
      .then(r => r.json())
      .then(d => { setReport(d); setLastUpdated(Date.now()) })
      .catch(() => setReport(null))
  }

  useEffect(() => {
    fetchReport()
    const t = setInterval(fetchReport, 5000)
    return () => clearInterval(t)
  }, [])

  const killProcess = (pid) => {
    fetch(`${API}/system/kill-process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid }),
    })
      .then(r => r.json())
      .then(() => { setKillModal(null); fetchReport() })
      .catch(() => setKillModal(null))
  }

  const barColor = (pct) => pct >= 75 ? '#ef4444' : pct >= 50 ? '#eab308' : '#22c55e'
  const processes = report?.processes ?? []
  const cpuTotal = report?.total_cpu ?? 0
  const memTotal = report?.total_memory ?? 0
  const battery = report?.battery

  return (
    <div style={{ paddingTop: 48, paddingBottom: 100, minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <h1 style={{ padding: '24px 24px 8px' }}>System Health</h1>
      <p style={{ padding: '0 24px 24px', color: '#9ca3af' }}>Last updated: {lastUpdated ? `${Math.round((Date.now() - lastUpdated) / 1000)}s ago` : '—'}</p>

      <div style={{ display: 'flex', gap: 16, padding: '0 24px 24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 160, padding: 20, background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>CPU</div>
          <div style={{ height: 8, background: '#1f2937', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, cpuTotal)}%`, height: '100%', background: barColor(cpuTotal), borderRadius: 4 }} />
          </div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>{cpuTotal.toFixed(1)}%</div>
        </div>
        <div style={{ flex: 1, minWidth: 160, padding: 20, background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>RAM</div>
          <div style={{ height: 8, background: '#1f2937', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${memTotal}%`, height: '100%', background: barColor(memTotal), borderRadius: 4 }} />
          </div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>{memTotal?.toFixed(1)}%</div>
        </div>
        <div style={{ flex: 1, minWidth: 160, padding: 20, background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Battery</div>
          <div style={{ height: 8, background: '#1f2937', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${battery?.percent ?? 0}%`, height: '100%', background: barColor(battery?.percent ?? 0), borderRadius: 4 }} />
          </div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>{battery?.percent ?? '—'}%</div>
        </div>
      </div>

      {cpuTotal >= 70 && (
        <div style={{ margin: 24, padding: 16, background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span>⚠️ CPU at {cpuTotal.toFixed(0)}% — {processes[0]?.name ?? 'process'} is the main consumer</span>
          <button type="button" onClick={() => processes[0] && setKillModal(processes[0])} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🗑️ Kill top process</button>
        </div>
      )}

      <div style={{ padding: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111', borderRadius: 12, overflow: 'hidden' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>#</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Process</th>
              <th style={{ padding: 12 }}>CPU%</th>
              <th style={{ padding: 12 }}>RAM%</th>
              <th style={{ padding: 12 }}>Power Score</th>
              <th style={{ padding: 12 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.slice(0, 15).map((proc, i) => {
              const powerColor = proc.power_score >= 50 ? '#ef4444' : proc.power_score >= 25 ? '#eab308' : '#22c55e'
              const cpuColor = (proc.cpu_percent || 0) > 50 ? '#ef4444' : (proc.cpu_percent || 0) > 25 ? '#eab308' : '#14b8a6'
              return (
                <tr key={proc.pid} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: 12 }}>{i + 1}</td>
                  <td style={{ padding: 12 }}>{proc.name}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'inline-block', width: 60, height: 6, background: '#1f2937', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, proc.cpu_percent || 0)}%`, height: '100%', background: cpuColor, borderRadius: 3 }} />
                    </div>
                    {' '}{(proc.cpu_percent || 0).toFixed(1)}%
                  </td>
                  <td style={{ padding: 12 }}>{(proc.memory_percent || 0).toFixed(1)}%</td>
                  <td style={{ padding: 12 }}><span style={{ color: powerColor }}>{(proc.power_score || 0).toFixed(1)}</span></td>
                  <td style={{ padding: 12 }}>
                    {proc.killable && (proc.cpu_percent || 0) > 15 && (
                      <button type="button" onClick={() => setKillModal(proc)} style={{ padding: '4px 10px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Kill</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {killModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setKillModal(null)}>
          <div style={{ background: '#111', padding: 24, borderRadius: 12, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>Kill process?</h3>
            <p style={{ color: '#9ca3af', marginBottom: 8 }}>Are you sure you want to kill {killModal.name}?</p>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>PID: {killModal.pid} · CPU: {killModal.cpu_percent?.toFixed(1)}%</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" onClick={() => setKillModal(null)} style={{ padding: '10px 20px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => killProcess(killModal.pid)} style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🗑️ Kill Process</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
