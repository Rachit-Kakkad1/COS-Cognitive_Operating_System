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
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDash = (progress / 100) * circumference

  // Calculate segment index for coloring
  const pct = progress / 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, paddingTop: 28 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, animation: 'fadeSlideUp 0.5s ease-out' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: 'linear-gradient(135deg,rgba(62,219,240,0.18),rgba(119,172,241,0.1))',
          border: '1px solid rgba(62,219,240,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: running ? '0 0 24px rgba(62,219,240,0.25)' : '0 0 12px rgba(62,219,240,0.08)',
          animation: running ? 'glowPulse 2s ease-in-out infinite' : 'none',
          transition: 'box-shadow 0.4s',
        }}>
          <FocusIcon active={running} size={22} />
        </div>
        <div>
          <h2 style={{
            fontSize: 26, fontWeight: 700,
            background: 'linear-gradient(135deg,#3EDBF0,#77ACF1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Focus Mode</h2>
          <p style={{ color: 'rgba(240,235,204,0.35)', fontSize: 12, marginTop: 2 }}>
            {running ? '🟢 Session in progress' : 'Deep work with context awareness'}
          </p>
        </div>
      </div>

      {/* ── Current Task ── */}
      {currentTask && (
        <div style={{
          background: 'rgba(4,0,154,0.15)',
          border: '1px solid rgba(62,219,240,0.22)',
          borderLeft: '3px solid rgba(62,219,240,0.55)',
          borderRadius: 16, padding: '14px 22px',
          maxWidth: 440, width: '100%', textAlign: 'center',
          boxShadow: '0 0 24px rgba(62,219,240,0.06)',
          animation: 'fadeSlideUp 0.45s ease-out',
        }}>
          <p style={{ color: 'rgba(240,235,204,0.38)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 7 }}>
            Context Anchor
          </p>
          <p style={{ color: 'var(--cream)', fontSize: 14, fontWeight: 500, lineHeight: 1.45 }}>{currentTask.summary}</p>
          {currentTask.app && (
            <p style={{ color: '#3EDBF0', fontSize: 11, marginTop: 7, fontWeight: 600 }}>📂 {currentTask.app}</p>
          )}
        </div>
      )}

      {/* ── Timer Ring ── */}
      <div style={{ position: 'relative', width: 230, height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Ambient glow — active only when running */}
        {running && (
          <div style={{
            position: 'absolute', inset: -16, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(62,219,240,0.1) 0%,transparent 70%)',
            animation: 'glowPulse 2.5s ease-in-out infinite',
          }} />
        )}

        {/* Decorative outer ring */}
        <div style={{
          position: 'absolute', inset: -6,
          border: '1px solid rgba(62,219,240,0.07)',
          borderRadius: '50%',
          animation: running ? 'spinReverse 20s linear infinite' : 'none',
        }} />

        {/* SVG progress ring */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
          <defs>
            <linearGradient id="focusRingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#3EDBF0" />
              <stop offset="50%"  stopColor="#77ACF1" />
              <stop offset="100%" stopColor="#04009A" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="rgba(119,172,241,0.07)"
            strokeWidth="3.5"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="url(#focusRingGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)', filter: 'drop-shadow(0 0 4px rgba(62,219,240,0.5))' }}
          />
          {/* Tick marks */}
          {[0, 15, 30, 45].map(angle => {
            const rad = (angle * Math.PI * 2) / 60 - Math.PI / 2
            const r1 = 41, r2 = 44
            return (
              <line key={angle}
                x1={50 + r1 * Math.cos(rad)} y1={50 + r1 * Math.sin(rad)}
                x2={50 + r2 * Math.cos(rad)} y2={50 + r2 * Math.sin(rad)}
                stroke="rgba(62,219,240,0.3)" strokeWidth="1.5" strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* Timer text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative', zIndex: 1 }}>
          <span style={{
            fontSize: 52, fontWeight: 300,
            fontFamily: "'Outfit', monospace",
            letterSpacing: '0.02em',
            color: 'var(--cream)',
            textShadow: running ? '0 0 30px rgba(62,219,240,0.45)' : 'none',
            transition: 'text-shadow 0.5s',
          }}>{mm}:{ss}</span>
          <span style={{
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600,
            color: running ? '#3EDBF0' : (done ? '#3EDBF0' : 'rgba(240,235,204,0.22)'),
            textShadow: running ? '0 0 10px rgba(62,219,240,0.5)' : 'none',
            transition: 'all 0.4s',
          }}>
            {done ? 'complete ✓' : running ? 'focusing…' : 'paused'}
          </span>
        </div>
      </div>

      {/* ── Thin progress bar ── */}
      <div style={{ width: '100%', maxWidth: 280, height: 3, background: 'rgba(119,172,241,0.08)', borderRadius: 2 }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg,#3EDBF0,#77ACF1)',
          borderRadius: 2,
          boxShadow: progress > 0 ? '0 0 10px rgba(62,219,240,0.4)' : 'none',
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <p style={{ color: 'rgba(240,235,204,0.2)', fontSize: 11, marginTop: -20 }}>
        {Math.round(progress)}% complete
      </p>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        {!running ? (
          <button onClick={start}
            style={{
              borderRadius: 14, padding: '13px 40px', fontSize: 14, fontWeight: 600,
              background: 'linear-gradient(135deg,rgba(62,219,240,0.18),rgba(119,172,241,0.12))',
              border: '1px solid rgba(62,219,240,0.42)',
              color: '#3EDBF0', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              boxShadow: '0 0 20px rgba(62,219,240,0.1)',
              transition: 'all 0.22s cubic-bezier(0.34,1.2,0.64,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(62,219,240,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 0 20px rgba(62,219,240,0.1)' }}
          >
            {secondsLeft < FOCUS_DURATION ? '▶ Resume' : '▶ Start'}
          </button>
        ) : (
          <button onClick={pause}
            style={{
              borderRadius: 14, padding: '13px 40px', fontSize: 14, fontWeight: 600,
              background: 'rgba(62,219,240,0.07)',
              border: '1px solid rgba(62,219,240,0.2)',
              color: '#77ACF1', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(62,219,240,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(62,219,240,0.2)'}
          >⏸ Pause</button>
        )}
        <button onClick={reset}
          style={{
            borderRadius: 14, padding: '13px 24px', fontSize: 14, fontWeight: 500,
            background: 'rgba(4,0,154,0.12)',
            border: '1px solid rgba(119,172,241,0.12)',
            color: 'rgba(240,235,204,0.3)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(240,235,204,0.6)'; e.currentTarget.style.borderColor = 'rgba(119,172,241,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,235,204,0.3)'; e.currentTarget.style.borderColor = 'rgba(119,172,241,0.12)' }}
        >↺ Reset</button>
      </div>

      {/* ── Done Banner ── */}
      {done && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(62,219,240,0.12),rgba(119,172,241,0.08))',
          border: '1px solid rgba(62,219,240,0.28)',
          borderRadius: 16, padding: '18px 32px', textAlign: 'center',
          animation: 'scaleIn 0.5s cubic-bezier(0.34,1.2,0.64,1)',
          boxShadow: '0 0 32px rgba(62,219,240,0.14)',
          maxWidth: 360,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
          <p style={{ color: '#3EDBF0', fontWeight: 700, fontSize: 16 }}>Session Complete!</p>
          <p style={{ color: 'rgba(240,235,204,0.45)', fontSize: 13, marginTop: 5 }}>Great work. Take a short break.</p>
        </div>
      )}
    </div>
  )
}
