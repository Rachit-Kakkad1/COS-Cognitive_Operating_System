import { useState, useEffect } from 'react'

const SystemGuardian = () => {
  const [cpuAlert, setCpuAlert]   = useState(null)
  const [killing, setKilling]     = useState(null)
  const [confirmed, setConfirmed] = useState(false)

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
