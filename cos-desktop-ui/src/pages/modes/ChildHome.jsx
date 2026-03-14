import { useState, useEffect } from 'react'
import { useMode } from '../../context/ModeContext'

export default function ChildHome() {
  const { currentMode } = useMode()
  const c = currentMode.colors

  const [questProgress, setQuestProgress] = useState(45)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 20 }}>
      
      {/* SECTION 1: Welcome banner */}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, borderRadius: 24, padding: '32px 40px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: `0 12px 32px ${c.primary}40` }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            Hi Arjun! <span style={{ animation: 'wave 2s infinite' }}>👋</span>
          </h1>
          <p style={{ fontSize: 20, fontWeight: 500, opacity: 0.9 }}>Ready to learn and play today?</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(10px)' }}>
          <span style={{ fontSize: 32 }}>⭐</span>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>247</div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>Stars Collected</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Quest */}
      <div style={{ background: c.surface, border: `3px solid ${c.border}`, borderRadius: 24, padding: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>🗺️</span> Today's Quest: Study for 2 hours!
        </h2>
        
        <div style={{ position: 'relative', height: 48, background: c.bg, borderRadius: 24, border: `2px solid ${c.border}`, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ width: `${questProgress}%`, height: '100%', background: `linear-gradient(90deg, ${c.primary}, ${c.accent})`, borderRadius: 24, transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
          <div style={{ position: 'absolute', left: `calc(${questProgress}% - 24px)`, top: 4, fontSize: 28, transition: 'left 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            🏃
          </div>
          <div style={{ position: 'absolute', right: 12, top: 6, fontSize: 24 }}>🏆</div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 18, color: c.secondary, fontWeight: 600 }}>
          You're doing amazing! Keep going! 🚀
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* SECTION 3: Subject Planets */}
        <div style={{ background: c.surface, border: `3px solid ${c.border}`, borderRadius: 24, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textMuted, marginBottom: 24 }}>Choose your planet:</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 160 }}>
            {/* Math Planet */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <div style={{ fontSize: 72, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>🪐</div>
              <div style={{ background: c.bg, padding: '6px 16px', borderRadius: 20, fontWeight: 700, color: c.text, border: `2px solid ${c.border}` }}>Math Planet</div>
            </div>

            {/* Science World */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <div style={{ fontSize: 90, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))', animation: 'float 4s infinite' }}>🌍</div>
              <div style={{ background: c.bg, padding: '6px 16px', borderRadius: 20, fontWeight: 700, color: c.text, border: `2px solid ${c.border}` }}>Science World</div>
            </div>

            {/* English Island */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <div style={{ fontSize: 64, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>📖</div>
              <div style={{ background: c.bg, padding: '6px 16px', borderRadius: 20, fontWeight: 700, color: c.text, border: `2px solid ${c.border}` }}>English Island</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SECTION 4: Reward Chest */}
          <div style={{ background: c.surface, border: `3px solid ${c.border}`, borderRadius: 24, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: c.text, marginBottom: 16 }}>Your Rewards</h2>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ padding: '8px 12px', background: c.bg, border: `2px solid ${c.primary}`, borderRadius: 12, fontSize: 14, fontWeight: 600, color: c.text }}>🔥 Hot Streak</span>
              <span style={{ padding: '8px 12px', background: c.bg, border: `2px solid ${c.accent}`, borderRadius: 12, fontSize: 14, fontWeight: 600, color: c.text }}>⚡ Fast Learner</span>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes wave { 0% { transform: rotate(0deg); } 20% { transform: rotate(14deg); } 40% { transform: rotate(-8deg); } 60% { transform: rotate(14deg); } 80% { transform: rotate(-4deg); } 100% { transform: rotate(0deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  )
}
