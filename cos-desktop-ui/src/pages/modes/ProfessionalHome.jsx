import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BrainLogo, SearchIcon, WifiIcon, AppIcon, ClockIcon, BoltIcon } from '../../components/Icons'
import { useMode } from '../../context/ModeContext'

const API = '/api'
const MODE_API = '/mode'

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <BrainLogo size={20} animated={false} />
      <span style={{ color: '#6366f1', fontSize: 14, fontWeight: 500 }}>System processing</span>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'inline-block', width: 6, height: 6,
          background: '#6366f1', borderRadius: '50%',
          animation: `dotBlink 1.2s ease-in-out infinite`,
          animationDelay: `${i * 0.22}s`,
        }} />
      ))}
    </div>
  )
}

function useTypewriter(text, speed = 45) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])
  return { displayed, done }
}

export default function ProfessionalHome() {
  const { currentMode } = useMode()
  const c = currentMode.colors

  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState(null)
  
  // Professional specific states
  const [sessionTime, setSessionTime] = useState(0)
  const [burnoutDetected, setBurnoutDetected] = useState(true) // Mock detection
  const cognitiveScore = 88 // Mock score

  const inputRef = useRef(null)
  const { displayed: tagline, done: taglineDone } = useTypewriter('Cognitive workspace active.', 55)

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.json()).then(setHealth).catch(() => {})
    
    // Track session time for break reminder (accelerated for demo: 1 real second = 1 min)
    const int = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 60000)
    return () => clearInterval(int)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await fetch(`${MODE_API}/recall?query=${encodeURIComponent(query)}&k=1&mode=professional`)
      const data = await res.json()
      setResult(data.results?.[0] || { message: 'No relevant data found in short-term memory.', app: '', timestamp: '' })
    } catch {
      setResult({ message: 'API cluster unreachable. Verify daemon status.', app: '', timestamp: '' })
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 12 }}>

      {/* Professional Header - Compact, info-dense */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: c.text, marginBottom: 4 }}>Workspace</h1>
          <p style={{ fontSize: 13, color: c.textMuted, fontFamily: 'monospace' }}>
            {tagline}
            {!taglineDone && <span style={{ borderRight: `2px solid ${c.primary}`, animation: 'blink 0.8s infinite' }} />}
          </p>
        </div>
        
        {/* Daily Cognitive Score */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: c.textMuted, letterSpacing: '0.05em', marginBottom: 4 }}>COGNITIVE SCORE</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: c.primary }}>{cognitiveScore}</div>
        </div>
      </div>

      {/* Burnout Warning Banner */}
      {burnoutDetected && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: `1px solid ${c.accent}`, borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.accent }}>Pattern Anomaly Detected: Elevated Context Switching</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>Metrics show a 40% drop in focus efficiency over the last 3 hours.</div>
            </div>
          </div>
          <button onClick={() => setBurnoutDetected(false)} style={{ background: 'transparent', border: `1px solid ${c.accent}`, color: c.accent, padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Acknowledge</button>
        </div>
      )}

      {/* Break Reminder */}
      {sessionTime >= 90 && (
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${c.primary}`, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>☕</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.primary }}>Continuous Operation: 90 Minutes</div>
            <div style={{ fontSize: 12, color: c.textMuted }}>Optimal cognitive performance requires a 10-minute system reset.</div>
          </div>
        </div>
      )}

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Query cognitive database (e.g. 'auth middleware error')"
            style={{
              width: '100%', borderRadius: 8,
              padding: '14px 20px',
              fontSize: 14, background: c.surface,
              color: c.text, border: `1px solid ${c.border}`,
              outline: 'none', fontFamily: 'monospace'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ 
            borderRadius: 8, padding: '14px 28px', fontSize: 13, fontWeight: 600,
            background: c.primary, color: '#fff', border: 'none', cursor: 'pointer',
            opacity: loading ? 0.6 : 1, fontFamily: 'monospace'
          }}
        >
          EXECUTE
        </button>
      </form>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ padding: '16px 0' }}>
          <ThinkingDots />
        </div>
      )}

      {/* ── Result Card ── */}
      {result && !loading && (
        <div style={{
            background: c.surface, borderRadius: 12, padding: '20px',
            borderLeft: `4px solid ${c.primary}`, border: `1px solid ${c.border}`
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: c.text, fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
                {result.message || result.summary}
              </p>
              {result.app && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: 11, background: c.bg, padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.border}`, color: c.textMuted }}>{result.app}</span>
                </div>
              )}
            </div>
            {result.timestamp && (
              <span style={{ color: c.textMuted, fontSize: 11, fontFamily: 'monospace' }}>{result.timestamp}</span>
            )}
          </div>

          {(result.cta || result.url) && (
             <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
              <button
                onClick={async () => {
                  if (result.url) window.open(result.url, '_blank')
                }}
                style={{
                  background: 'transparent',
                  border: `1px solid ${c.primary}`,
                  borderRadius: 6, padding: '8px 16px',
                  color: c.primary, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {result.cta || "Initialize Context"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── System Status ── */}
      {!result && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Latency', val: '12ms', color: '#10b981' },
            { label: 'Memories', val: health?.memories ?? 0, color: c.text },
            { label: 'Daemon', val: 'Active', color: '#10b981' },
            { label: 'Vector Store', val: 'Synced', color: '#10b981' },
          ].map((item, i) => (
             <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, padding: '16px', textAlign: 'center' }}>
               <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
               <div style={{ fontSize: 16, fontWeight: 500, color: item.color, fontFamily: 'monospace' }}>{item.val}</div>
             </div>
          ))}
        </div>
      )}
    </div>
  )
}
