import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

export default function OverlayRecall() {
  const [recall, setRecall] = useState(null)
  const [visible, setVisible] = useState(false)

  // Poll for hotkey recall result every 3 seconds
  useEffect(() => {
    let last = null
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/hotkey/recall`, { method: 'POST' })
        const data = await res.json()
        if (data.result && data.result.memory_id !== last) {
          last = data.result.memory_id
          setRecall(data.result)
          setVisible(true)

          // Auto-dismiss after 8 seconds
          setTimeout(() => setVisible(false), 8000)
        }
      } catch {
        // Backend offline
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (!visible || !recall) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm animate-[slideUp_0.3s_ease-out]">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-5 shadow-2xl
                      shadow-violet-500/10 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 text-lg">🧠</span>
          <span className="text-xs text-violet-400/80 uppercase tracking-wider font-medium">COS Recall</span>
        </div>
        <p className="text-sm text-zinc-200">{recall.summary}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{recall.app} · {recall.timestamp}</span>
          <button
            onClick={() => setVisible(false)}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Resume? →
          </button>
        </div>
        {/* Progress bar auto-dismiss */}
        <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500/50 animate-[shrink_8s_linear_forwards]" />
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
