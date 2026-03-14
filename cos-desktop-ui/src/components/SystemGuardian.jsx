import { useState, useEffect } from 'react'

const SystemGuardian = () => {
  const [cpuAlert, setCpuAlert]       = useState(null)
  const [powerList, setPowerList]     = useState([])
  const [showPower, setShowPower]     = useState(false)
  const [killing, setKilling]         = useState(null)
  const [confirmed, setConfirmed]     = useState(false)

  // Poll CPU every 10 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch('/system/cpu-snapshot')
        const data = await res.json()
        if (data.spike && data.top_process) {
          setCpuAlert(data)
        }
      } catch (e) {}
    }
    poll()
    const interval = setInterval(poll, 10000)
    return () => clearInterval(interval)
  }, [])

  // Load power list
  useEffect(() => {
    fetch('/system/power-monitor')
      .then(r => r.json())
      .then(d => setPowerList(d.processes || []))
      .catch(() => {})
  }, [])

  const killProcess = async (pid, name) => {
    if (!confirmed) { setKilling({pid, name}); return }
    try {
      await fetch('/system/kill-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid })
      })
      setCpuAlert(null)
      setKilling(null)
      setConfirmed(false)
    } catch (e) {}
  }

  return (
    <>
      {/* CPU Spike Alert Overlay */}
      {cpuAlert && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '380px', background: '#1a0000',
          border: '1px solid #ef4444', borderRadius: '12px',
          padding: '20px', zIndex: 9998,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display:'flex',
                        justifyContent:'space-between',
                        marginBottom:'12px' }}>
            <span style={{ color:'#ef4444',
                           fontWeight:600, fontSize:'14px' }}>
              ⚠️ High CPU Alert
            </span>
            <button onClick={() => setCpuAlert(null)}
              style={{ background:'none', border:'none',
                       color:'#a1a1aa', cursor:'pointer' }}>×</button>
          </div>

          <div style={{ marginBottom:'16px' }}>
            <div style={{ color:'#fff', fontSize:'15px',
                          fontWeight:600, marginBottom:'6px' }}>
              CPU at {cpuAlert.cpu_total.toFixed(0)}%
            </div>
            <div style={{ color:'#a1a1aa', fontSize:'13px' }}>
              Top process: <span style={{ color:'#ef4444' }}>
                {cpuAlert.top_process?.name}
              </span> using {cpuAlert.top_process?.cpu_pct?.toFixed(0)}%
            </div>
            <div style={{ color:'#a1a1aa', fontSize:'12px',
                          marginTop:'4px' }}>
              Memory: {cpuAlert.memory_pct?.toFixed(0)}% used
            </div>
          </div>

          {/* Kill confirmation */}
          {killing ? (
            <div style={{ background:'rgba(239,68,68,0.1)',
                          border:'1px solid #ef4444',
                          borderRadius:'8px', padding:'12px',
                          marginBottom:'12px' }}>
              <div style={{ color:'#fca5a5', fontSize:'13px',
                            marginBottom:'10px' }}>
                Are you sure you want to terminate
                <strong> {killing.name}</strong>?
                Unsaved work may be lost.
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => {
                  setConfirmed(true)
                  killProcess(killing.pid, killing.name)
                }} style={{
                  flex:1, padding:'8px',
                  background:'#ef4444', color:'#fff',
                  border:'none', borderRadius:'6px',
                  cursor:'pointer', fontSize:'12px'
                }}>Yes, kill it</button>
                <button onClick={() => setKilling(null)} style={{
                  flex:1, padding:'8px', background:'#1a1a1a',
                  color:'#a1a1aa', border:'1px solid #2a2a2a',
                  borderRadius:'6px', cursor:'pointer',
                  fontSize:'12px'
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() =>
                killProcess(cpuAlert.top_process?.pid,
                            cpuAlert.top_process?.name)
              } style={{
                flex:1, padding:'10px',
                background:'#ef4444', color:'#fff',
                border:'none', borderRadius:'8px',
                cursor:'pointer', fontSize:'13px', fontWeight:500
              }}>🗑️ Kill process</button>
              <button onClick={() => setCpuAlert(null)} style={{
                flex:1, padding:'10px', background:'#1a1a1a',
                color:'#a1a1aa', border:'1px solid #2a2a2a',
                borderRadius:'8px', cursor:'pointer', fontSize:'13px'
              }}>✓ Ignore</button>
            </div>
          )}
        </div>
      )}

      {/* Power Monitor Toggle Button */}
      <div style={{
        position:'fixed', bottom:'24px', left:'24px',
        zIndex: 9997
      }}>
        <button onClick={() => setShowPower(!showPower)} style={{
          background:'#1a1a1a', border:'1px solid #2a2a2a',
          color:'#a1a1aa', padding:'10px 16px',
          borderRadius:'10px', cursor:'pointer', fontSize:'13px'
        }}>
          🔋 Power {showPower ? '▼' : '▲'}
        </button>

        {/* Power drain panel */}
        {showPower && (
          <div style={{
            position:'absolute', bottom:'48px', left:0,
            width:'320px', background:'#111',
            border:'1px solid #2a2a2a', borderRadius:'12px',
            padding:'16px'
          }}>
            <div style={{ color:'#6366f1', fontSize:'11px',
                          fontWeight:600, letterSpacing:'0.1em',
                          marginBottom:'12px' }}>
              TOP POWER CONSUMING PROCESSES
            </div>
            {powerList.slice(0,8).map((proc, i) => (
              <div key={proc.pid} style={{
                display:'flex', alignItems:'center',
                gap:'10px', padding:'8px 0',
                borderBottom:'1px solid #1a1a1a'
              }}>
                <span style={{ color:'#a1a1aa',
                               fontSize:'11px', width:'16px' }}>
                  {i+1}
                </span>
                <span style={{ flex:1, fontSize:'13px',
                               color:'#e0e0e0',
                               overflow:'hidden',
                               textOverflow:'ellipsis',
                               whiteSpace:'nowrap' }}>
                  {proc.name}
                </span>
                <span style={{
                  fontSize:'12px', fontWeight:600,
                  color: proc.critical ? '#ef4444' :
                         proc.warning  ? '#eab308' : '#22c55e'
                }}>
                  {proc.cpu_pct}%
                </span>
                {proc.critical && (
                  <button onClick={() =>
                    setKilling({pid: proc.pid, name: proc.name})
                  } style={{
                    padding:'3px 8px', background:'#ef4444',
                    color:'#fff', border:'none',
                    borderRadius:'4px', cursor:'pointer',
                    fontSize:'11px'
                  }}>Kill</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(80px); opacity:0; }
          to   { transform: translateY(0);    opacity:1; }
        }
      `}</style>
    </>
  )
}

export default SystemGuardian
