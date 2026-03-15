import { useState } from 'react'
import { MicIcon, SearchIcon, SendIcon, ClockIcon, AppIcon } from '../components/Icons'

const API = 'http://localhost:8000'

/* ── Thinking dots ── */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-3 justify-center py-4">
      <span className="text-cos-primary text-sm font-medium">Searching memories</span>
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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pt-6 relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cos-primary/10 border border-cos-primary/20 flex items-center justify-center text-cos-primary shadow-sm">
          <MicIcon active={true} size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Ask Memory</h2>
          <p className="text-sm text-cos-muted mt-1">
            Type or speak your question — COS recalls semantically.
          </p>
        </div>
      </div>

      {/* ── Input Row ── */}
      <div className="relative z-10 flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex gap-3">
          {/* Search input */}
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cos-muted transition-colors group-focus-within:text-cos-primary">
              <SearchIcon size={18} color="currentColor" />
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What was I working on?"
              className="w-full bg-cos-card border border-cos-border text-white text-sm rounded-xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-500 focus:border-cos-primary focus:ring-1 focus:ring-cos-primary shadow-sm"
            />
          </div>

          {/* Search button */}
          <button type="submit" disabled={loading}
            className="bg-cos-card hover:bg-cos-primary/10 border border-cos-border hover:border-cos-primary/30 text-white font-medium text-sm px-6 py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm">
            <SendIcon size={16} color="currentColor" className={loading ? 'text-zinc-500' : 'text-cos-primary'} />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Mic button */}
          <button
            type="button"
            onClick={startVoice}
            title={listening ? 'Listening…' : 'Start voice input'}
            className={`w-14 flex items-center justify-center rounded-xl border transition-all duration-300 shadow-sm ${listening ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-cos-card border-cos-border text-cos-muted hover:text-white hover:border-cos-muted/50'}`}
          >
            <MicIcon active={listening} size={20} />
          </button>
        </form>

        {listening && (
          <div className="flex items-center gap-3 py-2 animate-in fade-in">
            <span className="text-red-500 text-xs font-semibold uppercase tracking-widest pl-2">Recording</span>
            <div className="flex gap-1 h-3 items-center">
              {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                <div key={i} className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && <div className="relative z-10"><ThinkingDots /></div>}

      {/* ── Results ── */}
      <div className="relative z-10 flex flex-col gap-4">
        {results.map((r, i) => (
          <div key={r.memory_id || i}
            className={`bg-cos-card border border-cos-border rounded-xl p-5 shadow-sm transition-all hover:bg-[#1a1a1c] cursor-pointer ${i === 0 ? 'border-l-4 border-l-cos-primary' : ''}`}
            onClick={() => r.url && window.open(r.url, '_blank')}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Rank badge */}
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-3 ${i === 0 ? 'bg-cos-primary/10 text-cos-primary' : 'bg-white/5 text-cos-muted'}`}>
                  #{i + 1}{i === 0 ? ' · Best Match' : ''}
                </span>

                <p className="text-white text-[15px] font-medium leading-relaxed">{r.summary}</p>

                {r.app && (
                  <div className="flex items-center gap-1.5 mt-3 text-cos-muted">
                    <AppIcon size={12} color="currentColor" />
                    <span className="text-xs font-semibold">{r.app}</span>
                  </div>
                )}
              </div>

              {r.timestamp && (
                <div className="flex items-center gap-1.5 text-cos-muted bg-white/5 px-2 py-1 rounded-md shrink-0">
                  <ClockIcon size={10} />
                  <span className="text-[10px] font-medium whitespace-nowrap">{r.timestamp}</span>
                </div>
              )}
            </div>

            {r.suggestion && (
              <div className="mt-4 pt-4 border-t border-cos-border">
                <span className="text-cos-primary text-xs font-semibold flex items-center gap-1">
                  {r.suggestion} <span className="opacity-70">→</span>
                </span>
              </div>
            )}
          </div>
        ))}

        {searched && !loading && results.length === 0 && (
          <div className="bg-cos-card border border-cos-dashed rounded-xl p-12 text-center shadow-inner">
            <div className="text-4xl mb-4 opacity-50">🔍</div>
            <p className="text-white text-sm font-medium">No memories found</p>
            <p className="text-cos-muted text-xs mt-2">Try branching out your search terms or browsing some apps first.</p>
          </div>
        )}
      </div>
    </div>
  )
}
