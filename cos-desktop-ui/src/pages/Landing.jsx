import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainLogo } from '../components/Icons'

/* ─────────────────────────────────────────────────────────────
   UTILITY COMPONENTS
───────────────────────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function AnimatedSection({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ─── Star / Particle field ─── */
function StarField({ count = 60 }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 1.618 * 6.3) % 100}%`,
    top: `${(i * 2.7 * 3.1) % 100}%`,
    size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.2,
    color: i % 4 === 0 ? '#3EDBF0' : i % 4 === 1 ? '#77ACF1' : i % 4 === 2 ? '#F0EBCC' : '#04009A',
    dur: 3 + (i % 7) * 0.5,
    delay: (i * 0.15) % 4,
    opacity: 0.12 + (i % 5) * 0.07,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: s.left, top: s.top,
          width: s.size, height: s.size,
          background: s.color,
          borderRadius: '50%',
          opacity: s.opacity,
          boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          animation: `float ${s.dur}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  )
}

/* ─── Gradient text ─── */
function GradText({ children, style = {} }) {
  return (
    <span style={{
      background: 'linear-gradient(135deg,#3EDBF0 0%,#77ACF1 45%,#F0EBCC 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      animation: 'gradientShift 5s linear infinite',
      ...style,
    }}>{children}</span>
  )
}

/* ─── Pill badge ─── */
function Pill({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(62,219,240,0.08)',
      border: '1px solid rgba(62,219,240,0.25)',
      borderRadius: 20, padding: '5px 14px',
      fontSize: 12, fontWeight: 600, color: 'rgba(62,219,240,0.9)',
      letterSpacing: '0.06em',
    }}>{children}</span>
  )
}

/* ─── Section divider ─── */
function Divider() {
  return (
    <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(62,219,240,0.2),transparent)', margin: '0 auto' }} />
  )
}

/* ─────────────────────────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, color = '#3EDBF0', delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [ref, visible] = useInView(0.1)

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(62,219,240,0.06)' : 'rgba(4,0,154,0.12)',
        border: `1px solid ${hovered ? color + '55' : 'rgba(119,172,241,0.12)'}`,
        borderRadius: 20,
        padding: '28px 24px',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : (visible ? 'translateY(0)' : 'translateY(28px)'),
        opacity: visible ? 1 : 0,
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? `0 16px 48px ${color}18` : 'none',
        transitionDelay: visible ? `${delay}s` : '0s',
      }}
    >
      {/* Glow top edge */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
        background: `linear-gradient(90deg,transparent,${color}66,transparent)`,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
      }} />

      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 18,
        background: `linear-gradient(135deg,${color}22,${color}0a)`,
        border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
        boxShadow: hovered ? `0 0 20px ${color}30` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        {icon}
      </div>

      <h3 style={{ color: 'var(--cream)', fontSize: 17, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
      <p style={{ color: 'rgba(240,235,204,0.45)', fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HOW IT WORKS STEP
───────────────────────────────────────────────────────────── */
function StepCard({ num, title, desc, icon, delay = 0 }) {
  const [ref, visible] = useInView(0.1)
  return (
    <div ref={ref} style={{
      display: 'flex', gap: 20, alignItems: 'flex-start',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-24px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>
      {/* Step number */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,rgba(62,219,240,0.2),rgba(119,172,241,0.1))',
        border: '1px solid rgba(62,219,240,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 800,
        color: '#3EDBF0',
        boxShadow: '0 0 20px rgba(62,219,240,0.15)',
      }}>{num}</div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <h4 style={{ color: 'var(--cream)', fontSize: 16, fontWeight: 700 }}>{title}</h4>
        </div>
        <p style={{ color: 'rgba(240,235,204,0.45)', fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STAT COUNTER
───────────────────────────────────────────────────────────── */
function StatCard({ value, label, icon, delay = 0 }) {
  const [ref, visible] = useInView(0.1)
  return (
    <div ref={ref} style={{
      textAlign: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.85)',
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{
        fontSize: 36, fontWeight: 800,
        background: 'linear-gradient(135deg,#3EDBF0,#77ACF1)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        lineHeight: 1,
      }}>{value}</div>
      <div style={{ color: 'rgba(240,235,204,0.4)', fontSize: 12, marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [navSolid, setNavSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => { setScrollY(window.scrollY); setNavSolid(window.scrollY > 60) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--cream)', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════
          TOP NAVBAR
      ══════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: navSolid ? 'rgba(2,0,21,0.85)' : 'transparent',
        backdropFilter: navSolid ? 'blur(24px)' : 'none',
        borderBottom: navSolid ? '1px solid rgba(62,219,240,0.1)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ filter: 'drop-shadow(0 0 10px rgba(62,219,240,0.4))' }}>
              <BrainLogo size={32} animated={false} />
            </div>
            <span style={{
              fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg,#3EDBF0,#77ACF1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>COS</span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['Features', '#features'], ['How it works', '#how'], ['Stack', '#stack']].map(([label, href]) => (
              <a key={label} href={href} style={{
                color: 'rgba(240,235,204,0.55)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = '#3EDBF0'}
                onMouseLeave={e => e.target.style.color = 'rgba(240,235,204,0.55)'}
              >{label}</a>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/auth')}
            style={{
              background: 'linear-gradient(135deg,rgba(62,219,240,0.2),rgba(119,172,241,0.12))',
              border: '1px solid rgba(62,219,240,0.4)',
              borderRadius: 10, padding: '8px 20px',
              color: '#3EDBF0', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(62,219,240,0.25)'; e.currentTarget.style.borderColor = 'rgba(62,219,240,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(62,219,240,0.4)' }}
          >Launch Extension →</button>
        </div>
      </nav>


      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
        overflow: 'hidden',
      }}>
        <StarField count={70} />

        {/* Large background glow */}
        <div style={{
          position: 'absolute',
          width: 800, height: 800,
          background: 'radial-gradient(circle,rgba(4,0,154,0.35) 0%,transparent 70%)',
          borderRadius: '50%', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          animation: 'glowPulse 5s ease-in-out infinite',
        }} />

        {/* Orbit rings */}
        {[300, 430, 560].map((size, i) => (
          <div key={i} style={{
            position: 'absolute', width: size, height: size,
            border: `1px solid rgba(62,219,240,${0.06 - i * 0.015})`,
            borderRadius: '50%',
            animation: `cyanRing ${4 + i * 1.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }} />
        ))}

        {/* Badge */}
        <div style={{ marginBottom: 28, animation: 'fadeSlideUp 0.5s ease-out' }}>
          <Pill>✦ HackCrux 2026 · Build With AI</Pill>
        </div>

        {/* Brain Logo */}
        <div style={{
          animation: 'float 5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 32px rgba(62,219,240,0.45))',
          marginBottom: 28, position: 'relative', zIndex: 1,
        }}>
          <BrainLogo size={96} animated={true} />
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(52px, 10vw, 96px)',
          fontWeight: 800, lineHeight: 1.0,
          letterSpacing: '-2px', marginBottom: 24,
          position: 'relative', zIndex: 1,
          animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.1s',
        }}>
          <GradText>Cognitive</GradText>
          <br />
          <span style={{ color: 'var(--cream)' }}>Operating System</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 19px)',
          color: 'rgba(240,235,204,0.5)',
          maxWidth: 580, lineHeight: 1.7,
          marginBottom: 48, position: 'relative', zIndex: 1,
          animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.2s',
          fontWeight: 400,
        }}>
          Your AI-powered cognitive extension that captures what you're doing,
          builds a semantic memory, and restores your focus in milliseconds —
          <strong style={{ color: 'rgba(240,235,204,0.85)' }}> fully local, fully offline.</strong>
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          position: 'relative', zIndex: 1,
          animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.35s',
        }}>
          <button
            onClick={() => navigate('/auth')}
            style={{
              background: 'linear-gradient(135deg,rgba(62,219,240,0.22),rgba(119,172,241,0.14))',
              border: '1px solid rgba(62,219,240,0.5)',
              borderRadius: 14, padding: '14px 36px',
              color: '#3EDBF0', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              boxShadow: '0 0 28px rgba(62,219,240,0.15)',
              transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(62,219,240,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(62,219,240,0.15)' }}
          >🚀 Launch Extension</button>

          <a href="#features" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'transparent',
              border: '1px solid rgba(240,235,204,0.15)',
              borderRadius: 14, padding: '14px 32px',
              color: 'rgba(240,235,204,0.55)', fontSize: 15, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(240,235,204,0.35)'; e.currentTarget.style.color = 'rgba(240,235,204,0.85)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,235,204,0.15)'; e.currentTarget.style.color = 'rgba(240,235,204,0.55)' }}
            >See How it Works ↓</button>
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: scrollY > 40 ? 0 : 0.5, transition: 'opacity 0.4s',
        }}>
          <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,235,204,0.4)' }}>Scroll</span>
          <div style={{
            width: 1, height: 40,
            background: 'linear-gradient(180deg,rgba(62,219,240,0.5),transparent)',
            animation: 'float 2s ease-in-out infinite',
          }} />
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {[
            { value: '100%', label: 'Local & Offline', icon: '🔒', delay: 0 },
            { value: '384d', label: 'Embedding Space', icon: '🧬', delay: 0.1 },
            { value: '<2s', label: 'Recall Speed', icon: '⚡', delay: 0.2 },
            { value: '∞', label: 'Stored Memories', icon: '🧠', delay: 0.3 },
          ].map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <AnimatedSection style={{ textAlign: 'center', marginBottom: 64 }}>
            <Pill>Features</Pill>
            <h2 style={{ fontSize: 'clamp(32px,6vw,52px)', fontWeight: 800, marginTop: 16, marginBottom: 14, letterSpacing: '-1px', lineHeight: 1.1 }}>
              Your brain,<br /><GradText>extended</GradText>
            </h2>
            <p style={{ color: 'rgba(240,235,204,0.45)', fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              COS silently watches, understands, and remembers everything you do so you never lose context again.
            </p>
          </AnimatedSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              {
                icon: '🧠', title: 'Semantic Memory', color: '#3EDBF0', delay: 0,
                desc: 'Every window, tab, and document you touch is embedded into a 384-dimensional semantic vector space using all-MiniLM-L6-v2 — locally, instantly.'
              },
              {
                icon: '⚡', title: 'Instant Recall', color: '#77ACF1', delay: 0.07,
                desc: 'Press Ctrl+Shift+R or say "What was I doing?" — COS surfaces the exact context you need in under 2 seconds using FAISS vector search.'
              },
              {
                icon: '🔀', title: 'Drift Detection', color: '#8AB4F8', delay: 0.14,
                desc: 'When cosine similarity drops below 0.4 between contexts, COS auto-detects you\'ve drifted and surfaces a "Take me back" overlay.'
              },
              {
                icon: '🌐', title: 'Chrome Extension', color: '#3EDBF0', delay: 0.21,
                desc: 'Captures active tab URL, title, time spent, and DOM text every 30 seconds. Offline-queued, deduplicated, and seamlessly synced to your memory.'
              },
              {
                icon: '📊', title: 'Memory Graph', color: '#77ACF1', delay: 0.28,
                desc: 'NetworkX builds a directed graph linking semantically similar memories (similarity > 0.8) and temporally proximate events (< 5 minutes apart).'
              },
              {
                icon: '🎯', title: 'Focus Mode', color: '#F0EBCC', delay: 0.35,
                desc: 'A Pomodoro timer anchored to your current cognitive task. COS knows what you were doing and keeps you from losing that thread again.'
              },
            ].map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

          {/* Left — description */}
          <div>
            <AnimatedSection>
              <Pill>How It Works</Pill>
              <h2 style={{ fontSize: 'clamp(28px,5vw,46px)', fontWeight: 800, marginTop: 16, marginBottom: 14, letterSpacing: '-1px', lineHeight: 1.15 }}>
                Capture → Embed<br /><GradText>→ Recall</GradText>
              </h2>
              <p style={{ color: 'rgba(240,235,204,0.45)', fontSize: 14, lineHeight: 1.8 }}>
                COS runs a silent background daemon that captures your OS context every 30 seconds. Each snapshot is embedded into vector space and stored in FAISS + SQLite. When you need to recall, a semantic search finds the most relevant memory — not just keywords.
              </p>
            </AnimatedSection>

            {/* Architecture diagram */}
            <AnimatedSection delay={0.2} style={{ marginTop: 32 }}>
              <div style={{
                background: 'rgba(4,0,154,0.12)',
                border: '1px solid rgba(62,219,240,0.15)',
                borderRadius: 16, padding: '20px 24px',
                fontFamily: 'monospace', fontSize: 12,
                color: 'rgba(240,235,204,0.5)', lineHeight: 2,
              }}>
                <div style={{ color: '#3EDBF0', fontWeight: 700, marginBottom: 8 }}>Architecture</div>
                <div><span style={{ color: '#77ACF1' }}>cos-extension</span> → Chrome context</div>
                <div><span style={{ color: '#77ACF1' }}>cos-ai-core</span>  → OS context + voice</div>
                <div style={{ paddingLeft: 16, color: 'rgba(240,235,204,0.3)' }}>↓ all-MiniLM-L6-v2 (384d)</div>
                <div><span style={{ color: '#3EDBF0' }}>cos-backend</span>  → FastAPI + FAISS + SQLite</div>
                <div style={{ paddingLeft: 16, color: 'rgba(240,235,204,0.3)' }}>↓ NetworkX graph</div>
                <div><span style={{ color: '#F0EBCC' }}>cos-desktop-ui</span> → React dashboard</div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right — steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { num: '01', icon: '👁️', title: 'Capture', delay: 0.05, desc: 'Active window, clipboard text, and Chrome tabs are captured every 30 seconds — silently and automatically.' },
              { num: '02', icon: '🧬', title: 'Embed', delay: 0.15, desc: 'Each snapshot is transformed into a 384-dimensional semantic vector via sentence-transformers, locally on your CPU.' },
              { num: '03', icon: '🗄️', title: 'Store', delay: 0.25, desc: 'Metadata goes to SQLite. Vectors go to FAISS. Relationships form a directed NetworkX graph. Everything persists locally.' },
              { num: '04', icon: '🔍', title: 'Recall', delay: 0.35, desc: 'Semantic FAISS search retrieves the most relevant memories in milliseconds. Context-switch detection triggers automatic recall.' },
            ].map(s => <StepCard key={s.num} {...s} />)}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════════ */}
      <section id="stack" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <AnimatedSection style={{ textAlign: 'center', marginBottom: 60 }}>
            <Pill>Tech Stack</Pill>
            <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, marginTop: 16, letterSpacing: '-1px' }}>
              Built with <GradText>cutting-edge</GradText> tech
            </h2>
          </AnimatedSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
            {[
              { name: 'all-MiniLM-L6-v2', role: 'Semantic Embeddings', color: '#3EDBF0', icon: '🧬' },
              { name: 'FAISS IndexFlatIP', role: 'Vector Search', color: '#77ACF1', icon: '⚡' },
              { name: 'Whisper small', role: 'Speech-to-Text', color: '#3EDBF0', icon: '🎙️' },
              { name: 'FastAPI', role: 'REST Backend', color: '#77ACF1', icon: '🚀' },
              { name: 'SQLite', role: 'Metadata Store', color: '#3EDBF0', icon: '🗄️' },
              { name: 'NetworkX', role: 'Memory Graph', color: '#77ACF1', icon: '🔗' },
              { name: 'React 18 + Vite', role: 'Desktop UI', color: '#3EDBF0', icon: '⚛️' },
              { name: 'Chrome MV3', role: 'Browser Extension', color: '#77ACF1', icon: '🌐' },
            ].map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.05}>
                <div style={{
                  background: 'rgba(4,0,154,0.1)',
                  border: `1px solid ${t.color}22`,
                  borderRadius: 14, padding: '16px 18px',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${t.color}55`; e.currentTarget.style.background = 'rgba(62,219,240,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${t.color}22`; e.currentTarget.style.background = 'rgba(4,0,154,0.1)' }}
                >
                  <span style={{ fontSize: 20, display: 'block', marginBottom: 8 }}>{t.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 13, color: t.color, marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,235,204,0.35)', letterSpacing: '0.05em' }}>{t.role}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Privacy note */}
          <AnimatedSection delay={0.2} style={{ marginTop: 48, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(62,219,240,0.05)',
              border: '1px solid rgba(62,219,240,0.15)',
              borderRadius: 14, padding: '12px 24px',
              color: 'rgba(240,235,204,0.5)', fontSize: 13,
            }}>
              <span style={{ color: '#3EDBF0', fontSize: 16 }}>🔒</span>
              <span><strong style={{ color: '#3EDBF0' }}>Fully local · Fully offline · Zero API keys · Zero cloud.</strong> Your data never leaves your machine.</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════
          DEMO FLOW
      ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection>
            <Pill>Live Demo</Pill>
            <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, marginTop: 16, marginBottom: 16, letterSpacing: '-1px' }}>
              See it in <GradText>60 seconds</GradText>
            </h2>
            <p style={{ color: 'rgba(240,235,204,0.45)', fontSize: 14, lineHeight: 1.8, marginBottom: 36 }}>
              Follow four steps to watch COS restore your cognitive context live.
            </p>
          </AnimatedSection>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { step: '1', text: 'Open Gmail → write a fake email about your project', color: '#3EDBF0' },
              { step: '2', text: 'Switch to YouTube and watch a random video', color: '#77ACF1' },
              { step: '3', text: 'Wait 10 seconds — COS detects the context drift', color: '#8AB4F8' },
              { step: '4', text: 'Press Ctrl+Shift+R or say "What was I doing?" — watch it recall', color: '#F0EBCC' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: 'rgba(4,0,154,0.1)',
                  border: `1px solid ${item.color}22`,
                  borderRadius: 14, padding: '16px 20px', textAlign: 'left',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg,${item.color}25,${item.color}10)`,
                    border: `1px solid ${item.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14, color: item.color,
                  }}>{item.step}</div>
                  <p style={{ color: 'rgba(240,235,204,0.7)', fontSize: 14, lineHeight: 1.5 }}>{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px 120px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600,
          background: 'radial-gradient(circle,rgba(4,0,154,0.4) 0%,transparent 70%)',
          borderRadius: '50%', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          animation: 'glowPulse 4s ease-in-out infinite',
        }} />

        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <AnimatedSection>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
              background: 'linear-gradient(135deg,rgba(62,219,240,0.2),rgba(119,172,241,0.1))',
              border: '1px solid rgba(62,219,240,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(62,219,240,0.25)',
              animation: 'glowPulse 3s ease-in-out infinite',
            }}>
              <BrainLogo size={40} animated={true} />
            </div>

            <h2 style={{ fontSize: 'clamp(30px,6vw,52px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1 }}>
              Never lose<br /><GradText>context again</GradText>
            </h2>
            <p style={{ color: 'rgba(240,235,204,0.45)', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
              COS runs silently, captures everything, and brings you back the moment you need it. No cloud. No cost. No compromise.
            </p>

            <button
              onClick={() => navigate('/auth')}
              style={{
                background: 'linear-gradient(135deg,rgba(62,219,240,0.25),rgba(119,172,241,0.18))',
                border: '1px solid rgba(62,219,240,0.55)',
                borderRadius: 16, padding: '16px 48px',
                color: '#3EDBF0', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                boxShadow: '0 0 36px rgba(62,219,240,0.2)',
                transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 52px rgba(62,219,240,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(62,219,240,0.2)' }}
            >🚀 Launch Extension</button>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(62,219,240,0.08)',
        padding: '28px 24px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <BrainLogo size={20} animated={false} />
          <span style={{
            fontSize: 15, fontWeight: 700,
            background: 'linear-gradient(135deg,#3EDBF0,#77ACF1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>COS</span>
          <span style={{ color: 'rgba(240,235,204,0.2)', fontSize: 14 }}>·</span>
          <span style={{ color: 'rgba(240,235,204,0.3)', fontSize: 12 }}>Cognitive Operating System</span>
        </div>
        <p style={{ color: 'rgba(240,235,204,0.2)', fontSize: 11, letterSpacing: '0.06em' }}>
          Built for HackCrux 2026 · Fully local · Fully offline · Zero cost
        </p>
      </footer>
    </div>
  )
}
