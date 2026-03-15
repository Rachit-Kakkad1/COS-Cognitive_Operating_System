import { useState, useEffect } from 'react'
import { useMode } from '../../context/ModeContext'

export default function StudentHome() {
  const { currentMode } = useMode()
  const c = currentMode.colors
  
  const [db, setDb] = useState(null)
  const [exams, setExams] = useState([])
  const [badges, setBadges] = useState([])
  
  // State for session launcher
  const [selectedSubject, setSelectedSubject] = useState('Physics')
  const [sessionDuration, setSessionDuration] = useState(50)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/student/dashboard').then(r => r.json()),
      fetch('/student/exams').then(r => r.json()),
      fetch('/student/badges').then(r => r.json())
    ]).then(([d, e, b]) => {
      setDb(d)
      setExams(e.exams)
      setBadges(b.badges)
    }).catch(() => {})
  }, [])

  const startSession = () => {
    setSessionActive(true)
    setSessionTime(sessionDuration * 60)
  }

  useEffect(() => {
    let int
    if (sessionActive && sessionTime > 0) {
      int = setInterval(() => setSessionTime(t => t - 1), 1000)
    } else if (sessionTime === 0) {
      setSessionActive(false)
    }
    return () => clearInterval(int)
  }, [sessionActive, sessionTime])

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 12 }}>
      
      {/* SECTION 1: Welcome Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: c.text, marginBottom: 8 }}>
            Good morning! Ready to crush it today? 🎓
          </h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', padding: '6px 12px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
              🔥 {db?.streak_days || 0} day streak
            </span>
            <span style={{ color: c.textMuted, fontSize: 14 }}>
              Today's goal: {db?.goal_minutes ? Math.round(db.goal_minutes/60) : 4} hours study
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: c.textMuted, marginBottom: 8 }}>
          <span>{db ? Math.round(db.total_study_minutes/60) : 0}h {db ? db.total_study_minutes%60 : 0}m studied</span>
          <span>{db?.goal_minutes ? db.goal_minutes/60 : 4}h goal</span>
        </div>
        <div style={{ width: '100%', height: 12, background: c.surface, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${db?.goal_progress_pct || 0}%`, height: '100%', background: c.primary, borderRadius: 6, transition: 'width 1s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SECTION 4: Study session launcher */}
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24 }}>
            {!sessionActive ? (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: c.text, marginBottom: 16 }}>Start a Study Session</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <select 
                    value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 14 }}
                  >
                    <option>Physics</option><option>Math</option><option>History</option><option>English</option>
                  </select>
                  <select 
                    value={sessionDuration} onChange={e => setSessionDuration(Number(e.target.value))}
                    style={{ width: 100, padding: '12px 16px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 14 }}
                  >
                    <option value={25}>25 min</option><option value={50}>50 min</option><option value={90}>90 min</option>
                  </select>
                </div>
                <button 
                  onClick={startSession}
                  style={{ width: '100%', background: c.primary, color: '#fff', padding: 14, borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                >
                  🚀 Start Focus Session
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h3 style={{ fontSize: 16, color: c.textMuted, marginBottom: 8 }}>Focusing on {selectedSubject}</h3>
                <div style={{ fontSize: 48, fontWeight: 700, color: c.primary, marginBottom: 20, fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(sessionTime)}
                </div>
                <button 
                  onClick={() => setSessionActive(false)}
                  style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 24px', borderRadius: 20, cursor: 'pointer' }}
                >
                  End Session Early
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: Subject tracker */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['Physics', 'Math', 'History', 'English'].map((sub, i) => (
                <div key={sub} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: c.text }}>{sub}</span>
                  <span style={{ fontSize: 12, color: c.textMuted, background: c.bg, padding: '4px 8px', borderRadius: 4 }}>{Math.floor(Math.random()*3)+1}h today</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SECTION 3: Exam countdown */}
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.textMuted, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming Exams</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {exams.length === 0 ? (
                <div style={{ fontSize: 14, color: c.textMuted }}>No exams scheduled!</div>
              ) : exams.map((ex, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    background: ex.urgency === 'critical' ? 'rgba(239, 68, 68, 0.1)' : ex.urgency === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                  }}>📅</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{ex.subject} exam</div>
                    <div style={{ fontSize: 13, color: ex.urgency === 'critical' ? '#ef4444' : ex.urgency === 'warning' ? '#f59e0b' : '#10b981' }}>in {ex.days_left} days</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: Achievements row */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.textMuted, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Badges</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'min-content min-content', gap: '16px auto', justifyContent: 'start' }}>
               {badges.map(b => (
                 <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: b.earned ? 1 : 0.4, filter: b.earned ? 'none' : 'grayscale(1)' }}>
                   <div style={{ width: 40, height: 40, borderRadius: 20, background: c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: `1px solid ${b.earned ? c.accent : c.border}` }}>
                     {b.emoji}
                   </div>
                   <div style={{ fontSize: 12, fontWeight: 600, color: c.text, whiteSpace: 'nowrap' }}>{b.label}</div>
                 </div>
               ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
