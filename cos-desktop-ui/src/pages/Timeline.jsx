import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

const SECTIONS = [
  { key: 'today', label: '📌 Today', color: 'violet' },
  { key: 'yesterday', label: '📅 Yesterday', color: 'blue' },
  { key: 'last_week', label: '📆 Last Week', color: 'emerald' },
  { key: 'last_month', label: '🗓️ Last Month', color: 'amber' },
]

export default function Timeline() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`${API}/timeline`)
      const json = await res.json()
      setData(json)
    } catch {
      setData({})
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTimeline()
    const interval = setInterval(fetchTimeline, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="pt-16 text-center text-zinc-500 animate-pulse">Loading timeline...</div>
    )
  }

  return (
    <div className="space-y-8 pt-6">
      <h2 className="text-2xl font-bold text-zinc-100">📅 Timeline</h2>

      {SECTIONS.map(sec => {
        const memories = data[sec.key] || []
        return (
          <div key={sec.key} className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              {sec.label}
              {memories.length > 0 && (
                <span className="ml-2 text-xs font-normal text-zinc-600">({memories.length})</span>
              )}
            </h3>

            {memories.length === 0 ? (
              <p className="text-zinc-600 text-xs pl-4">No memories</p>
            ) : (
              <div className="space-y-2">
                {memories.map((m, i) => (
                  <div key={m.memory_id || i}
                    className="bg-zinc-900/50 border border-zinc-800/40 rounded-xl px-4 py-3 flex items-center gap-4
                               hover:border-violet-500/20 transition-colors">
                    <div className={`w-2 h-2 rounded-full bg-${sec.color}-400 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 truncate">{m.summary || m.title}</p>
                      <p className="text-xs text-zinc-600">{m.app}</p>
                    </div>
                    <span className="text-xs text-zinc-600 whitespace-nowrap">{m.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
