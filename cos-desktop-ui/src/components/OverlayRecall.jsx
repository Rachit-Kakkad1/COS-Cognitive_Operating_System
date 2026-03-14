import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

export default function OverlayRecall() {
  const [recall, setRecall] = useState(null)
  const [visible, setVisible] = useState(false)

  // Poll for hotkey recall result every 3 seconds
  useEffect(() => {
    let lastRecallId = null
    let lastSwitchTs = null

    const interval = setInterval(async () => {
      try {
        // 1. Check for context switches first (higher priority)
        const switchRes = await fetch(`${API}/switch_status`)
        const switchData = await switchRes.json()
        if (switchData.event && switchData.event.timestamp !== lastSwitchTs) {
          lastSwitchTs = switchData.event.timestamp
          const prev = switchData.event.from
          setRecall({
            ...prev,
            type: 'switch',
            message: `Switched from ${prev.app}. Go back?`
          })
          setVisible(true)
          setTimeout(() => setVisible(false), 8000)
          return // Skip normal recall if switch alert is shown
        }

        // 2. Normal hotkey recall
        const res = await fetch(`${API}/hotkey/recall`, { method: 'POST' })
        const data = await res.json()
        if (data.result && data.result.memory_id !== lastRecallId) {
          lastRecallId = data.result.memory_id
          setRecall({ ...data.result, type: 'recall' })
          setVisible(true)
          setTimeout(() => setVisible(false), 8000)
        }
      } catch {
        // Backend offline
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleResume = async () => {
    if (recall.url) {
      window.open(recall.url, '_blank')
    } else {
      // Native app — try to reopen via backend
      try {
        await fetch(`${API}/reopen`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app: recall.app,
            title: recall.title || null
          })
        })
      } catch (e) {
        console.error("Failed to reopen native app", e)
      }
    }
    setVisible(false)
  }

  if (!visible || !recall) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm animate-[slideUp_0.3s_ease-out]">
      <div className={`backdrop-blur-xl border rounded-2xl p-5 shadow-2xl space-y-3
                      ${recall.type === 'switch' 
                        ? 'bg-amber-950/90 border-amber-500/40 shadow-amber-500/10' 
                        : 'bg-zinc-900/95 border-violet-500/30 shadow-violet-500/10'}`}>
        <div className="flex items-center gap-2">
          <span className={recall.type === 'switch' ? 'text-amber-400' : 'text-violet-400'}>
            {recall.type === 'switch' ? '⚠️' : '🧠'}
          </span>
          <span className={`text-xs uppercase tracking-wider font-medium 
                          ${recall.type === 'switch' ? 'text-amber-400/80' : 'text-violet-400/80'}`}>
            {recall.type === 'switch' ? 'Context Switch' : 'COS Recall'}
          </span>
        </div>
        <p className="text-sm text-zinc-200">
          {recall.type === 'switch' ? recall.message : recall.summary}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {recall.type === 'switch' ? recall.title : `${recall.app} · ${recall.timestamp}`}
          </span>
          <button
            onClick={handleResume}
            className={`text-xs font-medium transition-colors 
                       ${recall.type === 'switch' ? 'text-amber-400 hover:text-amber-300' : 'text-violet-400 hover:text-violet-300'}`}
          >
            {recall.type === 'switch' ? 'Take me back ←' : (recall.url ? 'Resume? →' : 'Dismiss')}
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
