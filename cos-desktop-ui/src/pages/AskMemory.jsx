import { useState } from 'react'

const API = 'http://localhost:8000'

export default function AskMemory() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)

  const doRecall = async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setResults([])
    try {
      const res = await fetch(`${API}/recall?query=${encodeURIComponent(q)}&k=5`)
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([{ summary: 'Backend unreachable.', app: '', timestamp: '', memory_id: 'err' }])
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doRecall(query)
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.')
      return
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRec()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
      doRecall(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.start()
  }

  return (
    <div className="space-y-6">
      <div className="pt-6 space-y-1">
        <h2 className="text-2xl font-bold text-zinc-100">🎙️ Ask Memory</h2>
        <p className="text-zinc-500 text-sm">Type or speak your question</p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What was I working on?"
          className="flex-1 bg-zinc-900/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm
                     placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-all"
        />
        <button type="submit" disabled={loading}
          className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 rounded-xl text-sm font-medium transition-colors">
          Search
        </button>
        <button
          type="button"
          onClick={startVoice}
          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            listening
              ? 'bg-red-500 animate-pulse text-white'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
          }`}
        >
          🎤
        </button>
      </form>

      {loading && (
        <div className="text-center py-8 text-violet-400 animate-pulse">🧠 COS is thinking...</div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={r.memory_id || i}
            className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 space-y-2
                       hover:border-violet-500/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-violet-400/80">#{i + 1}</span>
                <p className="text-zinc-200 text-sm mt-1">{r.summary}</p>
                {r.app && <p className="text-zinc-500 text-xs mt-1">{r.app}</p>}
              </div>
              <span className="text-zinc-600 text-xs">{r.timestamp}</span>
            </div>
            {r.suggestion && (
              <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                {r.suggestion}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
