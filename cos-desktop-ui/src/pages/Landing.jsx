// Landing.jsx
// Master COS landing page — connects to all products
// Dark professional theme
// Port: 5173 (NEWCOS frontend)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TYPEWRITER_LINES = [
  '→ "You were debugging FastAPI authentication..."',
  '→ "You were studying Chapter 4 — Heat Transfer..."',
  '→ "Your team was working on Series A valuation..."',
  '→ "You were drafting the HackCrux vendor email..."',
];

export default function Landing() {
  const navigate = useNavigate();
  const [typewriterIndex, setTypewriterIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTypewriterIndex((i) => (i + 1) % TYPEWRITER_LINES.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const showComingSoon = () => {
    if (typeof window !== 'undefined' && window.toast) {
      window.toast('Coming Soon');
    } else {
      alert('Coming Soon');
    }
  };

  const openTeamsApp = () => {
    window.open('http://localhost:5175', '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{
      backgroundColor: '#0f0f0f',
      color: '#e0e0e0',
      minHeight: '100vh',
      fontFamily: "'Outfit', sans-serif",
      paddingBottom: 0,
      margin: 0,
    }}>
      {/* NAVBAR — fixed · 64px */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(15,15,15,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #1a1a1a',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxSizing: 'border-box',
      }}>
        <div
          style={{ fontSize: '14px', color: '#fff', cursor: 'pointer' }}
          onClick={() => scrollToSection('hero')}
        >
          🧠 COS · Cognitive Operating System
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '14px' }} onClick={() => scrollToSection('how-it-works')}>Features</span>
          <span style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '14px' }} onClick={() => scrollToSection('demo')}>Demo</span>
          <span style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '14px' }} onClick={() => window.open('http://localhost:5176', '_blank', 'noopener,noreferrer')}>WorkSense</span>
          <button
            style={{
              background: '#6366f1',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
            onClick={() => scrollToSection('products')}
          >
            → Try Now
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" style={{
        paddingTop: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          color: '#6366f1',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 600,
          background: 'rgba(99,102,241,0.15)',
          padding: '6px 16px',
          borderRadius: '999px',
        }}>
          COGNITIVE OPERATING SYSTEM
        </div>
        <h1 style={{
          fontSize: '56px',
          color: '#fff',
          fontWeight: 700,
          margin: '32px 0 0',
          lineHeight: 1.15,
        }}>
          The AI Layer That<br />Preserves Human Thinking
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#a1a1aa',
          maxWidth: '560px',
          lineHeight: 1.6,
          margin: '20px 0 0',
        }}>
          Context recall. Cognitive graphs. Always-on voice.<br />
          For individuals, teams, and enterprises.
        </p>
        {/* Typewriter — rotating 3s */}
        <div style={{
          marginTop: '32px',
          minHeight: '32px',
          fontSize: '16px',
          color: '#818cf8',
          fontStyle: 'italic',
          transition: 'opacity 0.3s',
        }}>
          {TYPEWRITER_LINES[typewriterIndex]}
        </div>
        {/* 4 stat pills */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px' }}>
          {['🧠 8 AI Models', '🔒 100% Local', '⚡ Zero Cloud', '🌍 Every Human'].map((text) => (
            <div
              key={text}
              style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#e0e0e0',
              }}
            >
              {text}
            </div>
          ))}
        </div>
        {/* 2 CTA buttons */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <button
            onClick={() => scrollToSection('products')}
            style={{
              background: '#6366f1',
              color: '#fff',
              padding: '14px 24px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
            }}
          >
            → Try COS Now
          </button>
          <button
            onClick={() => scrollToSection('demo')}
            style={{
              background: 'transparent',
              color: '#a1a1aa',
              padding: '14px 24px',
              borderRadius: '10px',
              border: '1px solid #2a2a2a',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            Watch Demo →
          </button>
        </div>
      </section>

      {/* HOW IT WORKS — 3 steps */}
      <section id="how-it-works" style={{
        padding: '80px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#fff', marginBottom: '48px' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          <div style={{ textAlign: 'center', padding: '24px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📡</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Step 1: COS captures</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa' }}>what you're doing silently</div>
            <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '8px', fontWeight: 600 }}>Passive</div>
          </div>
          <div style={{ textAlign: 'center', padding: '24px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Step 2: Semantic</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa' }}>embeddings + graph built automatically</div>
            <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '8px', fontWeight: 600 }}>Intelligent</div>
          </div>
          <div style={{ textAlign: 'center', padding: '24px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎙</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Step 3: You recall</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa' }}>anything instantly by voice</div>
            <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '8px', fontWeight: 600 }}>Instant</div>
          </div>
        </div>
      </section>

      {/* THREE PRODUCT CARDS — id="products" */}
      <section id="products" style={{
        padding: '40px 24px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' }}>
          {/* COS Personal — purple border */}
          <div style={{
            background: '#111',
            borderRadius: '16px',
            padding: '32px',
            width: '320px',
            border: '1px solid #6366f1',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧠</div>
            <div style={{ fontSize: '20px', color: '#fff', fontWeight: 600 }}>COS Personal</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>For individuals</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '4px' }}>Free → $9.99/mo</div>
            <div style={{ flex: 1, minHeight: '24px' }} />
            <button
              onClick={() => navigate('/home')}
              style={{
                background: '#6366f1',
                color: '#fff',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                width: '100%',
              }}
            >
              → Open COS
            </button>
          </div>

          {/* COS Teams — amber · MOST POPULAR · scale 1.04 */}
          <div style={{
            position: 'relative',
            background: '#111',
            borderRadius: '16px',
            padding: '32px',
            width: '320px',
            border: '2px solid #f59e0b',
            display: 'flex',
            flexDirection: 'column',
            transform: 'scale(1.04)',
            boxShadow: '0 0 40px rgba(245,158,11,0.12)',
          }}>
            <div style={{
              position: 'absolute',
              top: '-14px',
              marginTop: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#f59e0b',
              color: '#000',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              ⭐ MOST POPULAR
            </div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '20px', color: '#fff', fontWeight: 600 }}>COS Teams</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>For co-founders and small teams</div>
            <div style={{ fontSize: '14px', color: '#f59e0b', marginTop: '4px' }}>$24.99/team/mo</div>
            <div style={{ flex: 1, minHeight: '24px' }} />
            <button
              onClick={openTeamsApp}
              style={{
                background: '#f59e0b',
                color: '#000',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                width: '100%',
              }}
            >
              → Get Teams
            </button>
          </div>

          {/* COS WorkSense — teal border */}
          <div style={{
            background: '#111',
            borderRadius: '16px',
            padding: '32px',
            width: '320px',
            border: '1px solid #14b8a6',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏢</div>
            <div style={{ fontSize: '20px', color: '#fff', fontWeight: 600 }}>COS WorkSense</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>For managers and enterprises</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '4px' }}>$49/month</div>
            <div style={{ flex: 1, minHeight: '24px' }} />
            <button
              onClick={() => window.open('http://localhost:5176', '_blank', 'noopener,noreferrer')}
              style={{
                background: '#14b8a6',
                color: '#fff',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                width: '100%',
              }}
            >
              → WorkSense
            </button>
          </div>
        </div>
      </section>

      {/* DEMO SECTION — id="demo" */}
      <section id="demo" style={{
        padding: '60px 24px',
        background: '#0a0a0a',
        borderTop: '1px solid #1a1a1a',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '24px', color: '#fff', marginBottom: '32px' }}>See COS in action</h2>
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {[
            '1. Open Gmail',
            '2. Switch tab',
            '3. Wait 10s',
            '4. Say "What was I doing?"',
            '5. Context restored ✅',
          ].map((step, i) => (
            <div
              key={i}
              style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#e0e0e0',
              }}
            >
              {step}
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#a1a1aa', marginTop: '24px' }}>
          Press Ctrl+Shift+R anytime to trigger recall
        </p>
      </section>

      {/* COMPETITIVE SECTION */}
      <section style={{
        padding: '60px 24px',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{
            flex: '1 1 280px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fca5a5', marginBottom: '16px' }}>What exists today</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px' }}>❌ Screenshots</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px' }}>❌ Keystrokes</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px' }}>❌ Time tracking</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px' }}>❌ Manual input</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '16px', fontStyle: 'italic' }}>"Track WHAT you clicked"</div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 800,
            color: '#6366f1',
          }}>
            VS
          </div>
          <div style={{
            flex: '1 1 280px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#86efac', marginBottom: '16px' }}>What COS does</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px' }}>✅ Semantic understanding</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px' }}>✅ Cognitive graph</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px' }}>✅ Voice recall</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px' }}>✅ Passive capture</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '16px', fontStyle: 'italic' }}>"Track WHAT you were THINKING"</div>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#a1a1aa',
          marginTop: '32px',
          padding: '12px',
        }}>
          Employee monitoring: $1.46B by 2032 · EdTech: $400B · Digital health: $500B · Total addressable: $565B+
        </div>
      </section>

      {/* PRIVACY BAR */}
      <section style={{
        background: '#0a0a0a',
        borderTop: '1px solid #1a1a1a',
        padding: '32px 24px',
      }}>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['🔒 No screenshots', '📵 No keystrokes', '🏠 Everything local', '👁 Always informed'].map((text) => (
            <div
              key={text}
              style={{
                background: '#111',
                border: '1px solid #2a2a2a',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#e0e0e0',
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#0a0a0a',
        borderTop: '1px solid #1a1a1a',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '16px', color: '#fff', fontWeight: 600 }}>🧠 COS · Cognitive Operating System</div>
        <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>Built with ❤️ by COS Team · HackCrux 2026</div>
        <div style={{ fontSize: '13px', color: '#71717a', marginTop: '12px' }}>"No cloud. No surveillance. No compromise."</div>
      </footer>
    </div>
  );
}
