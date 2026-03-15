import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BrainLogo, SearchIcon, WifiIcon, AppIcon, ClockIcon, BoltIcon } from '../components/Icons'

const API = 'http://localhost:8000'

/* ── Thinking dots ── */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-3">
      <div className="text-cos-primary animate-pulse">
        <BrainLogo size={20} animated={false} />
      </div>
      <span className="text-cos-primary text-sm font-medium">COS is thinking</span>
      <div className="flex gap-1 ml-1">
        {[0, 1, 2].map(i => (
          <span key={i} 
            className="block w-1.5 h-1.5 bg-cos-primary rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} 
          />
        ))}
      </div>
    </div>
  )
}

/* ── Typewriter hook ── */
function useTypewriter(text, speed = 40) {
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
  const { displayed: tagline, done: taglineDone } = useTypewriter('Your cognitive operating system.')

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
    <div className="flex flex-col gap-10 pt-8 relative max-w-4xl mx-auto w-full">

      {/* ── Minimal Grid Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* ── Hero Section ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center pb-4 min-h-[220px]">
        
        {/* Brain SVG logo */}
        <div className="relative mb-6 text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <BrainLogo size={64} animated={false} />
        </div>

        {/* COS Title */}
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-white mb-3">
          COS
        </h1>

        {/* Typewriter tagline */}
        <p className="text-sm text-cos-muted font-medium tracking-wide h-5 flex items-center justify-center">
          {tagline}
          {!taglineDone && (
            <span className="inline-block w-0.5 h-4 bg-cos-primary ml-1 animate-pulse" />
          )}
        </p>

        {/* Backend status pill */}
        {health && (
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 bg-cos-primary/10 border border-cos-primary/20 rounded-full text-xs font-semibold text-cos-primary">
            <WifiIcon size={12} color="currentColor" />
            Online &middot; {health.memories ?? 0} active thoughts
          </div>
        )}
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} className="relative z-10 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cos-muted transition-colors group-focus-within:text-cos-primary">
            <SearchIcon size={18} color="currentColor" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask COS anything... e.g. What was I working on?"
            className="w-full bg-cos-card border border-cos-border text-white text-sm rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-500 focus:border-cos-primary focus:ring-1 focus:ring-cos-primary shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-cos-primary hover:bg-cos-primaryHover text-white font-medium text-sm px-8 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-cos-primary/20"
        >
          Recall
        </button>
      </form>

      {/* ── Loading ── */}
      {loading && (
        <div className="relative z-10 flex justify-center py-8">
          <ThinkingDots />
        </div>
      )}

      {/* ── Result Card ── */}
      {result && !loading && (
        <div className="relative z-10 bg-cos-card/80 backdrop-blur-md border border-cos-border border-l-4 border-l-cos-primary rounded-xl p-6 shadow-xl card-animate">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-white text-base font-medium leading-relaxed">{result.summary}</p>
              {result.app && (
                <div className="flex items-center gap-1.5 mt-3 text-cos-primary">
                  <AppIcon size={14} color="currentColor" />
                  <span className="text-xs font-bold tracking-wide">{result.app}</span>
                </div>
              )}
            </div>
            {result.timestamp && (
              <div className="flex items-center gap-1.5 text-cos-muted bg-white/5 px-2.5 py-1 rounded-md">
                <ClockIcon size={12} />
                <span className="text-[11px] font-medium whitespace-nowrap">{result.timestamp}</span>
              </div>
            )}
          </div>

          {result.suggestion && (
            <div className="mt-5 pt-4 border-t border-cos-border">
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
                className="inline-flex items-center gap-2 bg-cos-primary/10 hover:bg-cos-primary/20 border border-cos-primary/30 text-cos-primary text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              >
                <BoltIcon size={14} color="currentColor" />
                {result.suggestion}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Quick Tip Cards ── */}
      {!result && !loading && (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: '⌨️', tip: 'Ctrl+Shift+R', sub: 'Instant recall hotkey everywhere', to: null },
            { icon: '🎙️', tip: '"What was I doing?"', sub: 'Voice-triggered natural recall', to: '/ask' },
            { icon: '📅', tip: 'View Timeline', sub: 'Browse memories chronologically', to: '/timeline' },
            { icon: '🎯', tip: 'Focus Mode', sub: 'Eliminate context switching', to: '/focus' },
          ].map((t, i) => {
            const cardContent = (
              <div className="bg-cos-card hover:bg-[#1f1f22] border border-cos-border hover:border-cos-border/80 rounded-xl p-5 transition-all duration-200 h-full flex items-start gap-4 group cursor-pointer shadow-sm">
                <div className="text-2xl mt-0.5 opacity-80 group-hover:scale-110 transition-transform">{t.icon}</div>
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">{t.tip}</h4>
                  <p className="text-cos-muted text-xs leading-relaxed">{t.sub}</p>
                </div>
              </div>
            )

            return t.to ? (
              <Link key={i} to={t.to} className="block outline-none">
                {cardContent}
              </Link>
            ) : (
              <div key={i}>{cardContent}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
