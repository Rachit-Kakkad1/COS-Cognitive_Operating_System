import { useState, useEffect, useRef } from 'react'
import { BrainLogo, SearchIcon, WifiIcon, AppIcon, ClockIcon, BoltIcon } from '../components/Icons'

const API = 'http://localhost:8000'

/* ── Floating star particles ── */
function StarField() {
  const stars = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.5 + 3) % 100}%`,
    top: `${(i * 7.3 + 5) % 100}%`,
    size: i % 3 === 0 ? 2.5 : i % 3 === 1 ? 1.8 : 1.2,
    color: i % 3 === 0 ? '#3EDBF0' : i % 3 === 1 ? '#77ACF1' : '#F0EBCC',
    dur: 3 + (i % 4) * 0.7,
    delay: i * 0.22,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: s.left, top: s.top,
          width: s.size, height: s.size,
          background: s.color,
          borderRadius: '50%',
          opacity: 0.0,
          boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          animation: `float ${s.dur}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }}
          // Use CSS animation opacity separately via keyframes to avoid inline override
          onAnimationStart={e => { e.currentTarget.style.opacity = 0.35 + (s.id % 3) * 0.15 }}
        />
      ))}
    </div>
  )
}

/* ── Thinking dots ── */
function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <BrainLogo size={20} animated={false} />
      <span style={{ color: '#3EDBF0', fontSize: 14, fontWeight: 500 }}>COS is thinking</span>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'inline-block', width: 6, height: 6,
          background: '#3EDBF0', borderRadius: '50%',
          animation: `dotBlink 1.2s ease-in-out infinite`,
          animationDelay: `${i * 0.22}s`,
          boxShadow: '0 0 6px rgba(62,219,240,0.6)',
        }} />
      ))}
    </div>
  )
}

/* ── Typewriter hook ── */
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

export default function Home() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState(null)
  const inputRef = useRef(null)
  const { displayed: tagline, done: taglineDone } = useTypewriter('Your cognitive operating system.', 55)

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.json()).then(setHealth).catch(() => {})
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await fetch(`${API}/recall?query=${encodeURIComponent(query)}&k=1`)
      const data = await res.json()
      setResult(data.results?.[0] || { summary: 'No memories found.', app: '', timestamp: '' })
    } catch {
      setResult({ summary: 'Backend unreachable. Start the backend at port 8000.', app: '', timestamp: '' })
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingTop: 28, position: 'relative' }}>

      {/* ── Hero Section ── */}
      <div style={{ textAlign: 'center', position: 'relative', paddingBottom: 8, minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <StarField />

        {/* Orbit ring 3 (furthest) */}
        <div style={{
          position: 'absolute', width: 220, height: 220,
          border: '1px solid rgba(62,219,240,0.06)',
          borderRadius: '50%',
          animation: 'cyanRingOuter 4s ease-in-out infinite',
          animationDelay: '1s',
        }} />
        {/* Orbit ring 2 */}
        <div style={{
          position: 'absolute', width: 160, height: 160,
          border: '1px solid rgba(62,219,240,0.12)',
          borderRadius: '50%',
          animation: 'cyanRing 3.5s ease-in-out infinite',
          animationDelay: '0.5s',
        }} />
        {/* Orbit ring 1 (inner) */}
        <div style={{
          position: 'absolute', width: 110, height: 110,
          border: '1px solid rgba(62,219,240,0.22)',
          borderRadius: '50%',
          animation: 'cyanRing 2.8s ease-in-out infinite',
        }} />

        {/* Brain SVG logo — floating */}
        <div style={{
          position: 'relative', zIndex: 2,
          animation: 'float 5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 24px rgba(62,219,240,0.4))',
          marginBottom: 22,
        }}>
          <BrainLogo size={72} animated={true} />
        </div>

        {/* COS title — shimmer gradient */}
        <h1 style={{
          position: 'relative', zIndex: 2,
          fontSize: 52, fontWeight: 800, lineHeight: 1,
          marginBottom: 12,
          background: 'linear-gradient(135deg,#3EDBF0 0%,#77ACF1 45%,#F0EBCC 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'gradientShift 5s linear infinite, fadeSlideUp 0.6s ease-out both',
          letterSpacing: '-1px',
        }}>COS</h1>

        {/* Typewriter tagline */}
        <p style={{
          position: 'relative', zIndex: 2,
          fontSize: 13, letterSpacing: '0.04em',
          color: 'rgba(240,235,204,0.5)',
          fontWeight: 400, minHeight: 20,
          animation: 'fadeIn 0.4s ease-out both',
          animationDelay: '0.3s',
        }}>
          {tagline}
          {!taglineDone && (
            <span style={{ borderRight: '2px solid #3EDBF0', marginLeft: 2, animation: 'blink 0.8s step-end infinite' }} />
          )}
        </p>

        {/* Backend status pill */}
        {health && (
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 14,
            background: 'rgba(62,219,240,0.07)',
            border: '1px solid rgba(62,219,240,0.2)',
            borderRadius: 20, padding: '5px 14px',
            fontSize: 11, color: 'rgba(62,219,240,0.85)', fontWeight: 500,
            animation: 'fadeSlideUp 0.5s ease-out both', animationDelay: '0.8s',
          }}>
            <WifiIcon size={11} color="#3EDBF0" />
            Online · {health.memories ?? 0} memories
          </div>
        )}
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <SearchIcon size={16} color="rgba(240,235,204,0.3)" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask COS anything… e.g. What was I working on?"
            className="input-cos"
            style={{
              width: '100%', borderRadius: 14,
              padding: '14px 20px 14px 40px',
              fontSize: 14, fontFamily: "'Outfit', sans-serif",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ borderRadius: 14, padding: '14px 28px', fontSize: 14, opacity: loading ? 0.6 : 1 }}
        >
          Recall
        </button>
      </form>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '16px 0', animation: 'fadeIn 0.2s' }}>
          <ThinkingDots />
        </div>
      )}

      {/* ── Result Card ── */}
      {result && !loading && (
        <div
          className="glass scanline-card"
          style={{
            borderRadius: 18, padding: '22px 26px',
            borderLeft: '3px solid rgba(62,219,240,0.55)',
            boxShadow: '0 8px 40px rgba(62,219,240,0.08)',
            animation: 'fadeSlideUp 0.4s cubic-bezier(0.34,1.1,0.64,1) both',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--cream)', fontSize: 15, fontWeight: 500, lineHeight: 1.55 }}>{result.summary}</p>
              {result.app && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
                  <AppIcon size={11} color="#3EDBF0" />
                  <p style={{ color: '#3EDBF0', fontSize: 11, fontWeight: 600 }}>{result.app}</p>
                </div>
              )}
            </div>
            {result.timestamp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ClockIcon size={11} />
                <span style={{ color: 'rgba(240,235,204,0.28)', fontSize: 11, whiteSpace: 'nowrap' }}>{result.timestamp}</span>
              </div>
            )}
          </div>

          {result.suggestion && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(62,219,240,0.1)' }}>
              <button
                onClick={async () => {
                  if (result.url) window.open(result.url, '_blank')
                  else {
                    try {
                      await fetch(`${API}/reopen`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ app: result.app, title: result.title || null })
                      })
                    } catch {}
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg,rgba(62,219,240,0.12),rgba(119,172,241,0.08))',
                  border: '1px solid rgba(62,219,240,0.28)',
                  borderRadius: 10, padding: '8px 18px',
                  color: '#3EDBF0', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(62,219,240,0.25)'; e.currentTarget.style.borderColor = 'rgba(62,219,240,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(62,219,240,0.28)' }}
              >
                <BoltIcon size={13} color="#3EDBF0" />
                {result.suggestion}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Quick Tip Cards ── */}
      {!result && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '⌨️', tip: 'Ctrl+Shift+R', sub: 'Instant recall hotkey' },
            { icon: '🎙️', tip: '"What was I doing?"', sub: 'Voice-triggered recall' },
            { icon: '📅', tip: 'View Timeline', sub: 'Browse memories by day' },
            { icon: '🎯', tip: 'Focus Mode', sub: 'Pomodoro + context anchor' },
          ].map((t, i) => (
            <div key={i}
              className="glass card-hover"
              style={{
                borderRadius: 14, padding: '16px',
                animation: `fadeSlideUp 0.4s cubic-bezier(0.34,1.1,0.64,1) both`,
                animationDelay: `${i * 0.08}s`,
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
              <p style={{ color: 'var(--cream)', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t.tip}</p>
              <p style={{ color: 'rgba(240,235,204,0.38)', fontSize: 11 }}>{t.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
