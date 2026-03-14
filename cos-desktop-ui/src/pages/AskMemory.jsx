import { useState } from 'react'
import { MicIcon, SearchIcon, SendIcon, ClockIcon, AppIcon } from '../components/Icons'

const API = 'http://localhost:8000'

/* ── Animated waveform bars for mic ── */
function MicWaveform() {
  const bars = [3, 6, 9, 12, 9, 6, 3, 6, 9, 7, 4]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 24 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2,
          background: 'linear-gradient(180deg,#3EDBF0,#77ACF1)',
          boxShadow: '0 0 4px rgba(62,219,240,0.5)',
          animation: `waveBar ${0.5 + (i % 4) * 0.15}s ease-in-out infinite`,
          animationDelay: `${i * 0.07}s`,
        }} />
      ))}
    </div>
  )
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
      <span style={{ color: '#3EDBF0', fontSize: 14, fontWeight: 500 }}>Searching memories</span>
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

export default function AskMemory() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [searched, setSearched]   = useState(false)

  const doRecall = async (q) => {
    if (!q.trim()) return
    setLoading(true); setResults([]); setSearched(true)
    try {
      const res  = await fetch(`${API}/recall?query=${encodeURIComponent(q)}&k=5`)
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([{ summary: 'Backend unreachable.', app: '', timestamp: '', memory_id: 'err' }])
    }
    setLoading(false)
  }

  const handleSubmit = (e) => { e.preventDefault(); doRecall(query) }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.')
      return
    }
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new Rec()
    rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = false
    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setQuery(t); doRecall(t) }
    rec.onerror  = () => setListening(false)
    rec.start()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 28 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'fadeSlideUp 0.5s ease-out' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: 'linear-gradient(135deg,rgba(62,219,240,0.18),rgba(119,172,241,0.12))',
          border: '1px solid rgba(62,219,240,0.32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(62,219,240,0.12)',
        }}>
          <MicIcon active={true} size={22} />
        </div>
        <div>
          <h2 style={{
            fontSize: 26, fontWeight: 700,
            background: 'linear-gradient(135deg,#3EDBF0,#77ACF1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Ask Memory</h2>
          <p style={{ color: 'rgba(240,235,204,0.38)', fontSize: 12, marginTop: 2 }}>
            Type or speak your question — COS recalls semantically
          </p>
        </div>
      </div>

      {/* ── Input Row ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
          {/* Search input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={15} color="rgba(240,235,204,0.28)" />
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What was I working on?"
              className="input-cos"
              style={{
                width: '100%', borderRadius: 14,
                padding: '14px 20px 14px 40px',
                fontSize: 14, fontFamily: "'Outfit', sans-serif",
              }}
            />
          </div>

          {/* Search button */}
          <button type="submit" disabled={loading}
            className="btn-primary"
            style={{
              borderRadius: 14, padding: '14px 22px', fontSize: 14,
              opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
            <SendIcon size={15} color="#3EDBF0" />
            Search
          </button>

          {/* Mic button */}
          <button
            type="button"
            onClick={startVoice}
            title={listening ? 'Listening…' : 'Start voice input'}
            style={{
              borderRadius: 14, padding: '14px 18px',
              background: listening
                ? 'linear-gradient(135deg,rgba(62,219,240,0.22),rgba(119,172,241,0.12))'
                : 'rgba(4,0,154,0.18)',
              border: listening
                ? '1px solid rgba(62,219,240,0.65)'
                : '1px solid rgba(119,172,241,0.18)',
              cursor: 'pointer',
              boxShadow: listening ? '0 0 24px rgba(62,219,240,0.3)' : 'none',
              animation: listening ? 'glowPulse 1.6s ease-in-out infinite' : 'none',
              transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <MicIcon active={listening} size={20} />
          </button>
        </form>

        {/* Waveform when listening */}
        {listening && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            padding: '12px 0', animation: 'fadeIn 0.25s',
          }}>
            <span style={{ color: '#3EDBF0', fontSize: 12, fontWeight: 500 }}>Listening</span>
            <MicWaveform />
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '12px 0', animation: 'fadeIn 0.2s' }}>
          <ThinkingDots />
        </div>
      )}

      {/* ── Results ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map((r, i) => (
          <div key={r.memory_id || i}
            className="glass scanline-card"
            style={{
              borderRadius: 16, padding: '18px 20px',
              animation: `fadeSlideUp 0.38s cubic-bezier(0.34,1.1,0.64,1) both`,
              animationDelay: `${i * 0.07}s`,
              cursor: r.url ? 'pointer' : 'default',
              transition: 'all 0.22s ease',
              borderLeft: i === 0 ? '3px solid rgba(62,219,240,0.55)' : '3px solid rgba(119,172,241,0.25)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(62,219,240,0.09)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = 'none' }}
            onClick={() => r.url && window.open(r.url, '_blank')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                {/* Rank badge */}
                <span style={{
                  display: 'inline-block',
                  background: i === 0
                    ? 'linear-gradient(135deg,rgba(62,219,240,0.25),rgba(119,172,241,0.15))'
                    : 'rgba(4,0,154,0.3)',
                  border: `1px solid ${i === 0 ? 'rgba(62,219,240,0.45)' : 'rgba(119,172,241,0.18)'}`,
                  borderRadius: 6, padding: '2px 9px',
                  fontSize: 10, fontWeight: 700,
                  color: i === 0 ? '#3EDBF0' : '#77ACF1',
                  letterSpacing: '0.08em', marginBottom: 9,
                }}>
                  #{i + 1}{i === 0 ? '  ·  Best Match' : ''}
                </span>

                <p style={{ color: 'var(--cream)', fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{r.summary}</p>

                {r.app && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                    <AppIcon size={11} color="#77ACF1" />
                    <p style={{ color: '#77ACF1', fontSize: 11, fontWeight: 500 }}>{r.app}</p>
                  </div>
                )}
              </div>

              {r.timestamp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockIcon size={11} />
                  <span style={{ color: 'rgba(240,235,204,0.28)', fontSize: 11, whiteSpace: 'nowrap' }}>{r.timestamp}</span>
                </div>
              )}
            </div>

            {r.suggestion && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(62,219,240,0.09)' }}>
                <span style={{ color: '#3EDBF0', fontSize: 12, fontWeight: 600 }}>
                  {r.suggestion} →
                </span>
              </div>
            )}
          </div>
        ))}

        {searched && !loading && results.length === 0 && (
          <div className="glass" style={{ borderRadius: 16, padding: '40px', textAlign: 'center', animation: 'scaleIn 0.35s ease-out' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ color: 'rgba(240,235,204,0.5)', fontSize: 14, fontWeight: 500 }}>No memories found</p>
            <p style={{ color: 'rgba(240,235,204,0.28)', fontSize: 12, marginTop: 5 }}>Try browsing some apps first.</p>
          </div>
        )}
      </div>
    </div>
  )
}
