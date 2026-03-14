import { useState, useEffect, useRef } from 'react'

const FOCUS_DURATION = 25 * 60 // 25 minutes in seconds

export default function FocusMode() {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const intervalRef = useRef(null)

  // Fetch current top task
  useEffect(() => {
    fetch('http://localhost:8000/hotkey/recall', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.result) setCurrentTask(data.result)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setDone(true)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const progress = ((FOCUS_DURATION - secondsLeft) / FOCUS_DURATION) * 100

  const start = () => { setRunning(true); setDone(false) }
  const pause = () => { setRunning(false); clearInterval(intervalRef.current) }
  const reset = () => {
    setRunning(false)
    setDone(false)
    setSecondsLeft(FOCUS_DURATION)
    clearInterval(intervalRef.current)
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 pt-12">
      <h2 className="text-2xl font-bold text-zinc-100">🎯 Focus Mode</h2>

      {/* Current task */}
      {currentTask && (
        <div className="bg-zinc-900/60 border border-violet-500/20 rounded-xl px-6 py-3 max-w-md text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Task</p>
          <p className="text-sm text-zinc-300">{currentTask.summary}</p>
          <p className="text-xs text-violet-400/60 mt-1">{currentTask.app}</p>
        </div>
      )}

      {/* Timer */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="3" />
          <circle cx="50" cy="50" r="45" fill="none"
            stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${progress * 2.83} 283`}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-5xl font-light text-zinc-100 tabular-nums">{mm}:{ss}</span>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!running ? (
          <button onClick={start}
            className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-medium transition-colors">
            {secondsLeft < FOCUS_DURATION ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={pause}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-medium transition-colors">
            Pause
          </button>
        )}
        <button onClick={reset}
          className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium text-zinc-400 transition-colors">
          Reset
        </button>
      </div>

      {/* Done */}
      {done && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-4 text-center
                        animate-[fadeIn_0.5s_ease-out]">
          <p className="text-emerald-400 font-medium">✅ Session complete. Great work.</p>
        </div>
      )}
    </div>
  )
}
