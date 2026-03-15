import { useEffect } from 'react'
import { FocusIcon } from '../components/Icons'
import { useFocus } from '../context/FocusContext'

export default function FocusMode() {
  const {
    secondsLeft, running, done, currentTask, setCurrentTask,
    start, pause, reset, FOCUS_DURATION
  } = useFocus()

  useEffect(() => {
    if (!currentTask) {
      fetch('http://localhost:8000/hotkey/recall', { method: 'POST' })
        .then(r => r.json())
        .then(data => { if (data.result) setCurrentTask(data.result) })
        .catch(() => {})
    }
  }, [currentTask, setCurrentTask])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const progress = ((FOCUS_DURATION - secondsLeft) / FOCUS_DURATION) * 100
  const radius = 55
  const circumference = 2 * Math.PI * radius
  const strokeDash = (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-10 pt-10 max-w-3xl mx-auto relative w-full">

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center gap-4 text-center flex-col sm:flex-row text-left">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-500 ${running ? 'bg-cos-primary/10 border-cos-primary/30 text-cos-primary shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-cos-card border-cos-border text-cos-muted'}`}>
          <FocusIcon active={running} size={28} />
        </div>
        <div className="flex items-center sm:items-start flex-col">
          <h2 className="text-3xl font-bold text-white tracking-tight">Focus Mode</h2>
          <p className="text-sm mt-1 font-medium transition-colors" style={{ color: running ? '#6366f1' : '#a1a1aa' }}>
            {running ? '🟢 Deep work session active' : 'Eliminate context switching'}
          </p>
        </div>
      </div>

      {/* ── Current Task ── */}
      <div className="relative z-10 w-full max-w-lg">
        {currentTask ? (
          <div className="bg-[#111113] border border-cos-border border-l-4 border-l-cos-primary rounded-xl p-5 shadow-sm text-center">
            <p className="text-[10px] text-cos-primary font-bold tracking-widest uppercase mb-2">Context Anchor</p>
            <p className="text-white text-sm font-medium leading-relaxed">{currentTask.summary}</p>
            {currentTask.app && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-md text-xs font-semibold text-cos-muted">
                📂 {currentTask.app}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-cos-card border border-cos-dashed rounded-xl p-5 text-center text-sm text-cos-muted shadow-sm">
            Press Ctrl+Shift+R to capture a task context, or just start focusing.
          </div>
        )}
      </div>

      {/* ── Timer Ring ── */}
      <div className="relative z-10 w-64 h-64 flex items-center justify-center mt-4">
        
        {/* Ambient glow */}
        {running && (
          <div className="absolute inset-[-10px] rounded-full bg-cos-primary/5 blur-xl animate-pulse -z-10" />
        )}

        {/* SVG Progress Arc */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#6366f1"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>

        {/* Timer text */}
        <div className="flex flex-col items-center">
          <span className="text-6xl font-extrabold text-white tracking-tighter tabular-nums mb-1 font-mono">
            {mm}:{ss}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${done ? 'text-green-400' : (running ? 'text-cos-primary animate-pulse' : 'text-zinc-600')}`}>
            {done ? 'session complete' : (running ? 'stay focused' : 'paused')}
          </span>
        </div>
      </div>

      {/* ── Linear Progress ── */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-2">
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cos-primary rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${progress}%` }} 
          />
        </div>
        <span className="text-xs text-cos-muted font-medium">{Math.floor(progress)}% complete</span>
      </div>

      {/* ── Controls ── */}
      <div className="relative z-10 flex gap-4 mt-2">
        {!running ? (
          <button onClick={start}
            className="bg-cos-primary hover:bg-cos-primaryHover text-white font-medium px-8 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            ▶ {secondsLeft < FOCUS_DURATION ? 'Resume' : 'Start Focus'}
          </button>
        ) : (
          <button onClick={pause}
            className="bg-cos-card hover:bg-white/5 border border-cos-border text-white font-medium px-8 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            ⏸ Pause
          </button>
        )}
        <button onClick={reset}
          className="bg-transparent hover:bg-white/5 border border-transparent text-cos-muted hover:text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          ↺ Reset
        </button>
      </div>

      {/* ── Done Banner ── */}
      {done && (
        <div className="relative z-10 mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center shadow-sm w-full max-w-sm animate-in zoom-in-95">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-green-400 font-bold text-lg mb-1">Session Complete!</p>
          <p className="text-green-400/70 text-sm">Great deep work. Time for a short break.</p>
        </div>
      )}
    </div>
  )
}
