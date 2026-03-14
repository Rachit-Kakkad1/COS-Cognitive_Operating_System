import { useState } from 'react'

const API = 'http://localhost:8000'

export default function Home() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${API}/recall?query=${encodeURIComponent(query)}&k=1`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setResult(data.results[0])
      } else {
        setResult({ summary: 'No memories found.', app: '', timestamp: '' })
      }
    } catch {
      setResult({ summary: 'Backend unreachable.', app: '', timestamp: '' })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 pt-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          🧠 NEWCOS
        </h1>
        <p className="text-zinc-500 text-sm">Your cognitive operating system</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask COS anything..."
          className="flex-1 bg-zinc-900/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm
                     placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1
                     focus:ring-violet-500/20 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700
                     rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? '...' : 'Recall'}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <span className="text-violet-400 text-lg">🧠 COS is thinking...</span>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4
                        backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-zinc-200 font-medium">{result.summary}</p>
              {result.app && (
                <p className="text-violet-400/80 text-sm">{result.app}</p>
              )}
            </div>
            {result.timestamp && (
              <span className="text-zinc-600 text-xs whitespace-nowrap">{result.timestamp}</span>
            )}
          </div>
          {result.suggestion && (
            <div className="pt-2 border-t border-zinc-800/50">
              <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                {result.suggestion}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
