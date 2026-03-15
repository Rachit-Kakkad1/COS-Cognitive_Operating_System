import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../context/ModeContext'
import { useTheme } from '../context/ThemeContext'

const ModeSelector = () => {
  const { MODES, selectMode } = useMode()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [personalizing, setPersonalizing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleSelect = async (modeId) => {
    setPersonalizing(true)
    selectMode(modeId)

    try {
      const res = await fetch('http://localhost:8000/role/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: modeId })
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('cos_role_token', data.token)
      }
    } catch (e) {
      console.warn('[Role] Backend save failed — using local only')
    }

    let p = 0
    const int = setInterval(() => {
      p += 15
      setProgress(Math.min(p, 100))
      if (p >= 100) {
        clearInterval(int)
        setTimeout(() => navigate('/home'), 200)
      }
    }, 150)
  }

  if (personalizing) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: theme.bg
      }}>
        <div style={{ fontSize: '48px', animation: 'pulse 1.5s infinite' }}>🧠</div>
        <h2 style={{ color: theme.text, marginTop: '24px', fontWeight: 600 }}>Personalizing COS for you...</h2>
        <div style={{ width: '280px', height: '6px', background: theme.border, borderRadius: '3px', marginTop: '20px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: theme.purple, transition: 'width 0.15s linear' }} />
        </div>
        <style>{`
          @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'background 0.3s' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
        <h1 style={{ color: theme.text, fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>Which version of COS are you?</h1>
        <p style={{ color: theme.textMuted, fontSize: '18px' }}>Choose your mode. COS becomes yours.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '960px', width: '100%' }}>
        
        {/* Professional */}
        <ModeCard 
          mode={MODES.professional} 
          onSelect={() => handleSelect('professional')}
          pills={['Context Recall', 'Voice AI', 'Cognitive Graph']}
          isDark={theme.dark}
        />

        {/* Student */}
        <ModeCard 
          mode={MODES.student} 
          onSelect={() => handleSelect('student')}
          pills={['Study Tracker', 'Exam Countdown', 'Streak']}
          isDark={theme.dark}
        />

        {/* Parent */}
        <ModeCard 
          mode={MODES.parent} 
          onSelect={() => handleSelect('parent')}
          pills={['Child Monitor', 'Screen Time', 'Safe Browsing']}
          isDark={theme.dark}
        />

        {/* Child */}
        <ModeCard 
          mode={MODES.child} 
          onSelect={() => handleSelect('child')}
          pills={['Fun Timer', 'Rewards', 'Safe Mode']}
          isDark={theme.dark} child
        />

        {/* Senior */}
        <ModeCard 
          mode={MODES.senior} 
          onSelect={() => handleSelect('senior')}
          pills={['Memory Help', 'Voice First', 'Simple UI']}
          isDark={theme.dark}
        />

        {/* Employee */}
        <ModeCard 
          mode={MODES.employee} 
          onSelect={() => handleSelect('employee')}
          pills={['Performance', 'Burnout Alert', 'Daily Goals']}
          isDark={theme.dark}
        />

      </div>
    </div>
  )
}

const ModeCard = ({ mode, onSelect, pills, isDark, child }) => {
  const [hover, setHover] = useState(false)
  const c = mode.colors[isDark ? 'dark' : 'light']

  return (
    <div 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: c.surface,
        border: `2px solid ${c.border}`,
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        height: '240px',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: hover ? 'scale(1.05)' : 'scale(1)',
        boxShadow: hover ? `0 0 24px ${c.primary}40` : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {child && hover && (
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '24px', animation: 'bounce 1s infinite' }}>✨</div>
      )}

      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{mode.emoji}</div>
      <h3 style={{ color: c.text, fontSize: '20px', fontWeight: 600, marginBottom: '6px' }}>{mode.label}</h3>
      <p style={{ color: c.textMuted, fontSize: '13px', marginBottom: '16px', lineHeight: 1.4 }}>{mode.description}</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'auto' }}>
        {pills.map(p => (
          <span key={p} style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${c.primary}40`,
            borderRadius: '12px', padding: '4px 10px',
            fontSize: '11px', color: c.text
          }}>
            {p}
          </span>
        ))}
      </div>

      <button onClick={(e) => { e.stopPropagation(); onSelect(); }} style={{
        marginTop: '16px',
        width: '100%',
        padding: mode.id === 'senior' ? '14px' : '10px',
        background: child ? `linear-gradient(45deg, ${c.primary}, ${c.secondary})` : c.primary,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        transition: '0.2s',
        opacity: hover ? 1 : 0.9
      }}>
        Choose {mode.label}
      </button>

      {child && (
        <style>{`
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        `}</style>
      )}
    </div>
  )
}

export default ModeSelector
