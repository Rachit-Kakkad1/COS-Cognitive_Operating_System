import { useState } from 'react'
import { useMode } from '../../context/ModeContext'

export default function SeniorHome() {
  const { currentMode } = useMode()
  const c = currentMode.colors

  const [dateStr] = useState(() => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())
  })
  
  const [timeStr, setTimeStr] = useState(() => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date())
  })

  // Simple memory state
  const [memoryActive, setMemoryActive] = useState(false)
  const syntheticSpeech = "You were reading an email from your doctor about your appointment on March 18th."

  const handleVoiceHelp = () => {
    setMemoryActive(true)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(syntheticSpeech)
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingTop: 20 }}>
      
      {/* SECTION 1: Big greeting */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, color: c.text, fontWeight: 600, marginBottom: 8 }}>Good afternoon! 👋</h1>
        <div style={{ fontSize: 28, color: c.primary, fontWeight: 700, marginBottom: 4 }}>{timeStr}</div>
        <div style={{ fontSize: 22, color: c.textMuted }}>{dateStr}</div>
      </div>

      {/* SECTION 2: Memory helper */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button 
          onClick={handleVoiceHelp}
          style={{ 
            background: c.primary, color: '#fff', border: 'none', 
            borderRadius: 32, padding: '24px 48px', 
            fontSize: 28, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)'
          }}
        >
          <span style={{ fontSize: 40 }}>🎤</span> What was I doing?
        </button>

        {memoryActive && (
          <div style={{ marginTop: 32, background: c.surface, border: `2px solid ${c.border}`, borderRadius: 16, padding: 32, maxWidth: 600, textAlign: 'center' }}>
            <p style={{ fontSize: 24, lineHeight: 1.5, color: c.text }}>{syntheticSpeech}</p>
            <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button style={{ padding: '16px 32px', fontSize: 20, background: c.secondary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}>Yes, take me there</button>
              <button onClick={() => setMemoryActive(false)} style={{ padding: '16px 32px', fontSize: 20, background: c.bg, border: `2px solid ${c.border}`, color: c.text, borderRadius: 12, cursor: 'pointer' }}>Close this</button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Reminders */}
      <div>
        <h2 style={{ fontSize: 28, color: c.text, marginBottom: 20, textAlign: 'center' }}>Your Reminders Today</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto' }}>
          
          <div style={{ background: '#fff', borderLeft: `8px solid ${c.accent}`, padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 40 }}>💊</span>
            <span style={{ fontSize: 24, color: c.text }}>Take your medication at 2:00 PM</span>
          </div>

          <div style={{ background: '#fff', borderLeft: `8px solid ${c.secondary}`, padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 40 }}>🚶</span>
            <span style={{ fontSize: 24, color: c.text }}>Time for your afternoon walk</span>
          </div>

        </div>
      </div>

      {/* SECTION 5: Emergency */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <button style={{ 
          background: 'transparent', border: `3px solid ${c.accent}`, color: c.accent,
          padding: '20px 40px', fontSize: 24, fontWeight: 600, borderRadius: 16,
          display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer'
        }}>
          <span style={{ fontSize: 32 }}>📞</span> Call for Help
        </button>
      </div>

    </div>
  )
}
