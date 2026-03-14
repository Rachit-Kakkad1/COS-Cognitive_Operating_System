import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const navigate = useNavigate();
  const [teamSize, setTeamSize] = useState(10);
  const [hoveredCard, setHoveredCard] = useState(null);

  // ROI calculations
  const mgmtHours  = (teamSize * 1.8).toFixed(0);
  const weeklyCost = (teamSize * 1.8 * 80).toFixed(0);
  const annualCost = (teamSize * 1.8 * 80 * 52).toFixed(0);
  const cosAnnual  = 49 * 12;
  const roiPct     = (((annualCost - cosAnnual) / cosAnnual) * 100).toFixed(0);
  const payback    = ((cosAnnual / annualCost) * 365).toFixed(1);

  const fmt = (n) => Number(n).toLocaleString();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: '#0f0f0f', color: '#e0e0e0', minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: 0, margin: 0 }}>
      {/* SECTION 1 - NAVBAR */}
      <nav style={{
        background: 'rgba(15,15,15,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #1a1a1a',
        position: 'fixed',
        top: 0,
        zIndex: 1000,
        width: '100%',
        height: '64px',
        padding: '0 80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
          🧠 COS
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '14px', fontWeight: 500 }} onClick={() => scrollToSection('pricing')} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#a1a1aa'}>Personal</span>
          <span style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '14px', fontWeight: 500 }} onClick={() => scrollToSection('pricing')} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#a1a1aa'}>Teams</span>
          <span style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '14px', fontWeight: 500 }} onClick={() => scrollToSection('pricing')} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#a1a1aa'}>WorkSense</span>
          <ThemeToggle />
          <button 
            style={{ background: '#6366f1', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
            onClick={() => scrollToSection('pricing')}
          >
            → Get Started
          </button>
        </div>
      </nav>

      {/* SECTION 2 - HERO */}
      <section id="hero" style={{ paddingTop: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
        <div style={{ color: '#6366f1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          COGNITIVE OPERATING SYSTEM
        </div>
        <div style={{ height: '48px' }}></div>
        <h1 style={{ fontSize: '56px', color: '#fff', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
          The AI Layer That Preserves<br/>Human Thinking
        </h1>
        <div style={{ height: '24px' }}></div>
        <div style={{ fontSize: '20px', color: '#a1a1aa', maxWidth: '600px', lineHeight: 1.5 }}>
          Context recall. Cognitive graphs. Always-on voice.<br/>
          For individuals, teams, and enterprises.
        </div>
        <div style={{ height: '48px' }}></div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {['🧠 8 AI Models', '🔒 100% Local', '⚡ Zero Cloud'].map(text => (
            <div key={text} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: '#e0e0e0' }}>
              {text}
            </div>
          ))}
        </div>
        <div style={{ height: '48px' }}></div>
        <div style={{ fontStyle: 'italic', fontSize: '18px', color: '#a1a1aa', lineHeight: 1.6 }}>
          "We built tools that remember files.<br/>
          We built tools that remember tasks.<br/>
          Now we build tools that remember thinking."
        </div>
      </section>

      {/* SECTION 3 - PRICING CARDS */}
      <section id="pricing" style={{ padding: '80px 40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'stretch', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* CARD 1 - Personal */}
          <div 
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: '#111111', borderRadius: '16px', padding: '32px', width: '360px', minHeight: '680px',
              display: 'flex', flexDirection: 'column', position: 'relative',
              transition: 'transform 0.2s ease',
              transform: hoveredCard === 1 ? 'translateY(-4px)' : 'translateY(0)',
              border: '1px solid #6366f1', boxSizing: 'border-box'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧠</div>
            <div style={{ fontSize: '24px', color: '#fff', fontWeight: 600 }}>COS Personal</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>For individuals who think for a living</div>
            <div style={{ height: '1px', background: '#1a1a1a', margin: '24px 0' }}></div>
            <div>
              <div style={{ fontSize: '36px', color: '#fff', fontWeight: 700, display: 'inline-block' }}>FREE</div>
              <span style={{ fontSize: '14px', color: '#a1a1aa', marginLeft: '8px' }}>→ PRO</span>
              <div style={{ fontSize: '28px', color: '#6366f1', fontWeight: 600, marginTop: '8px' }}>$9.99 <span style={{fontSize: '14px', color: '#a1a1aa', fontWeight: 400}}>/ month</span></div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>Billed monthly</div>
            </div>
            <div style={{ height: '1px', background: '#1a1a1a', margin: '24px 0' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#e0e0e0' }}>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Context recall — remembers what you were doing</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Always-on voice — RNNoise + VAD + Whisper small</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Cognitive graph — maps your thinking automatically</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Tab Guardian — alerts on every app switch</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Memory timeline — today · yesterday · last week</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Focus mode — 25min deep work timer</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Drift detection — catches distraction instantly</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Chrome extension — captures browser context</span></div>
            </div>
            <div style={{ flex: 1 }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '32px' }}>
              <button onClick={() => navigate('/auth?mode=personal')} style={{ background: '#6366f1', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, width: '100%' }}>
                → Get COS Personal
              </button>
              <button style={{ background: 'transparent', color: '#6366f1', border: '1px solid #6366f1', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, width: '100%' }}>
                + Add to Chrome
              </button>
            </div>
          </div>

          {/* CARD 2 - Teams */}
          <div 
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: '#111111', borderRadius: '16px', padding: '32px', width: '360px', minHeight: '680px',
              display: 'flex', flexDirection: 'column', position: 'relative',
              transition: 'transform 0.2s ease',
              transform: hoveredCard === 2 ? 'scale(1.06)' : 'scale(1.03)',
              border: '2px solid #f59e0b', boxShadow: '0 0 40px rgba(245,158,11,0.15)', boxSizing: 'border-box'
            }}
          >
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#000', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              ⭐ MOST POPULAR
            </div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '24px', color: '#fff', fontWeight: 600 }}>COS Teams</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>For co-founders and small teams (2–10 people)</div>
            <div style={{ height: '1px', background: '#2a2a2a', margin: '24px 0' }}></div>
            <div>
              <div style={{ fontSize: '36px', color: '#f59e0b', fontWeight: 700, display: 'inline-block' }}>$24.99</div>
              <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>/ team / month</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>Up to 10 people</div>
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 500, marginTop: '8px' }}>Everything in Personal +</div>
            </div>
            <div style={{ height: '1px', background: '#2a2a2a', margin: '24px 0' }}></div>
            
            <div style={{ fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>PERSONAL FEATURES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#a1a1aa', marginBottom: '16px' }}>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Context recall + Voice + Tab Guardian</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Cognitive graph + Memory timeline</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Drift detection + Chrome extension</span></div>
            </div>

            <div style={{ fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>TEAMS FEATURES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#e0e0e0' }}>
              <div style={{display:'flex', gap:'8px'}}><span>⚡</span><span>Shared cognitive graph — 10 people connected</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>⚡</span><span>Cognitive Handoff — transfer thinking via QR code</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>⚡</span><span>Cross-device sync — up to 3 devices per person</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>⚡</span><span>Co-founder mode — see what your co-founder is in</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>⚡</span><span>Basic team view — who's focused right now</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>⚡</span><span>Weekly team report — auto-generated every Friday</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>⚡</span><span>2 admin controls — basic visibility settings</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>⚡</span><span>Cognitive Handoff QR code — instant context transfer</span></div>
            </div>

            <div style={{ flex: 1 }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '32px' }}>
              <button onClick={() => navigate('/auth?mode=teams')} style={{ background: '#f59e0b', color: '#000', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, width: '100%' }}>
                → Get COS Teams
              </button>
              <button style={{ background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, width: '100%' }}>
                + Add to Chrome
              </button>
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#a1a1aa', marginTop: '12px' }}>
                14-day free trial · No credit card required
              </div>
            </div>
          </div>

          {/* CARD 3 - WorkSense */}
          <div 
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: '#111111', borderRadius: '16px', padding: '32px', width: '360px', minHeight: '680px',
              display: 'flex', flexDirection: 'column', position: 'relative',
              transition: 'transform 0.2s ease',
              transform: hoveredCard === 3 ? 'translateY(-4px)' : 'translateY(0)',
              border: '1px solid #14b8a6', boxSizing: 'border-box'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
            <div style={{ fontSize: '24px', color: '#fff', fontWeight: 600 }}>COS WorkSense</div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>For managers and enterprises (11+ people)</div>
            <div style={{ height: '1px', background: '#1a1a1a', margin: '24px 0' }}></div>
            <div>
              <div style={{ fontSize: '36px', color: '#14b8a6', fontWeight: 700, display: 'inline-block' }}>$49</div>
              <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>/ month</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>Up to 50 people</div>
              <div style={{ fontSize: '12px', color: '#14b8a6', fontWeight: 500, marginTop: '8px' }}>Everything in Teams +</div>
            </div>
            <div style={{ height: '1px', background: '#1a1a1a', margin: '24px 0' }}></div>

            <div style={{ fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>TEAMS FEATURES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#a1a1aa', marginBottom: '16px' }}>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Shared graph + Handoff + Cross-device sync</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Co-founder mode + Team view</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>✅</span><span>Weekly report + Admin controls</span></div>
            </div>

            <div style={{ fontSize: '11px', color: '#14b8a6', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>ENTERPRISE FEATURES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#e0e0e0' }}>
              <div style={{display:'flex', gap:'8px'}}><span>🏢</span><span>Live manager dashboard — every employee real-time</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>🏢</span><span>Employee IDs + passwords — role-based access</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>🏢</span><span>Productivity Matrix — score + tips per employee</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>🏢</span><span>Focus Intelligence Report — daily team cognitive report</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>🏢</span><span>Power consumption monitor — which app drains most</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>🏢</span><span>CPU spike alerts — kill task at 85% usage</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>🏢</span><span>Compliance export — SOC2 ready reports</span></div>
              <div style={{display:'flex', gap:'8px'}}><span>🏢</span><span>SSO + SAML — enterprise authentication</span></div>
            </div>

            <div style={{ flex: 1 }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '32px' }}>
              <button onClick={() => navigate('/auth?mode=worksense')} style={{ background: '#14b8a6', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, width: '100%' }}>
                → Get COS WorkSense
              </button>
              <button style={{ background: 'transparent', color: '#14b8a6', border: '1px solid #14b8a6', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, width: '100%' }}>
                + Add to Chrome
              </button>
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#14b8a6', marginTop: '12px', cursor: 'pointer' }} onMouseOver={e=>e.target.style.textDecoration='underline'} onMouseOut={e=>e.target.style.textDecoration='none'}>
                Need 50+ seats? Contact us for Enterprise pricing →
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* SECTION 4 - FEATURE COMPARISON TABLE */}
      <section id="compare" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '0 40px 80px', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: '#6366f1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>COMPARE PLANS</div>
          <div style={{ fontSize: '32px', color: '#fff', fontWeight: 600, marginTop: '8px' }}>Everything you need to know</div>
        </div>

        <div style={{ background: '#111', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 400px) 1fr 1fr 1fr', background: '#1a1a1a', padding: '16px 24px', fontSize: '14px', fontWeight: 600 }}>
            <div style={{ color: '#e0e0e0' }}>Feature</div>
            <div style={{ color: '#6366f1' }}>Personal</div>
            <div style={{ color: '#f59e0b' }}>Teams</div>
            <div style={{ color: '#14b8a6' }}>WorkSense</div>
          </div>
          
          {[
            ['Context recall', '✅', '✅', '✅'],
            ['Always-on voice', '✅', '✅', '✅'],
            ['Tab Guardian', '✅', '✅', '✅'],
            ['Cognitive graph', 'Personal', 'Shared', 'Shared'],
            ['Memory timeline', '✅', '✅', '✅'],
            ['Chrome extension', '✅', '✅', '✅'],
            ['Cross-device sync', '❌', '✅ 3 devices', '✅ unlimited'],
            ['Cognitive Handoff', '❌', '✅', '✅'],
            ['Co-founder mode', '❌', '✅', '✅'],
            ['Team view', '❌', 'Basic', 'Full'],
            ['Weekly report', '❌', '✅', '✅'],
            ['Manager dashboard', '❌', '❌', '✅'],
            ['Employee IDs', '❌', '❌', '✅'],
            ['Productivity Matrix', '❌', '❌', '✅'],
            ['Focus Intelligence Report', 'Personal', 'Team', 'Team + Manager'],
            ['Power monitor', '❌', '❌', '✅'],
            ['CPU spike alerts', '❌', '❌', '✅'],
            ['Admin controls', '❌', '2 controls', 'Full'],
            ['SSO + SAML', '❌', '❌', '✅'],
            ['Compliance export', '❌', '❌', '✅'],
            ['Price', 'Free/$9.99', '$24.99/team', '$49/month'],
          ].map((row, idx) => (
            <div key={idx} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(250px, 400px) 1fr 1fr 1fr', 
              background: idx % 2 === 0 ? '#111' : '#0f0f0f', 
              padding: '14px 24px', 
              fontSize: '14px', 
              color: '#e0e0e0',
              borderTop: idx === 0 ? 'none' : '1px solid #1a1a1a'
            }}>
              <div>{row[0]}</div>
              <div style={{ color: row[1] === '✅' ? '#22c55e' : row[1] === '❌' ? 'rgba(239, 68, 68, 0.5)' : '#fff' }}>{row[1]}</div>
              <div style={{ color: row[2] === '✅' ? '#22c55e' : row[2] === '❌' ? 'rgba(239, 68, 68, 0.5)' : '#fff' }}>{row[2]}</div>
              <div style={{ color: row[3] === '✅' ? '#22c55e' : row[3] === '❌' ? 'rgba(239, 68, 68, 0.5)' : '#fff' }}>{row[3]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 - ROI CALCULATOR */}
      <section id="roi" style={{ padding: '0 40px 80px', boxSizing: 'border-box' }}>
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '16px', maxWidth: '800px', margin: '0 auto', padding: '48px', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ color: '#14b8a6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>ROI CALCULATOR</div>
            <div style={{ fontSize: '28px', color: '#fff', fontWeight: 600, marginTop: '8px' }}>See your return on investment</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '12px' }}>Team size</div>
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="range" 
                min="2" max="100" 
                value={teamSize} 
                onChange={(e) => setTeamSize(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#14b8a6', cursor: 'grab' }}
              />
            </div>
            <div style={{ fontSize: '20px', color: '#fff', fontWeight: 600, marginTop: '12px' }}>{teamSize} employees</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: '#1a1a1a', border: '1px solid #14b8a6', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', color: '#f59e0b', fontWeight: 700 }}>{fmt(mgmtHours)} hrs/week</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '8px' }}>floor walks + status meetings</div>
            </div>
            
            <div style={{ background: '#1a1a1a', border: '1px solid #14b8a6', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', color: '#ef4444', fontWeight: 700 }}>${fmt(weeklyCost)}/week</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '8px' }}>at $80/hr manager cost</div>
            </div>

            <div style={{ background: '#1a1a1a', border: '1px solid #14b8a6', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', color: '#14b8a6', fontWeight: 700 }}>$49/month</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '8px' }}>Growth plan</div>
            </div>

            <div style={{ background: '#1a1a1a', border: '1px solid #14b8a6', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', color: '#22c55e', fontWeight: 700 }}>{fmt(roiPct)}%</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '8px' }}>Payback: {payback} days</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 - PRIVACY TRUST BAR */}
      <section style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a', padding: '40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            '🔒 No screenshots ever',
            '📵 No keystrokes logged',
            '🏠 Everything stays local',
            '👁️ Employee always informed'
          ].map(text => (
            <div key={text} style={{ background: '#111', border: '1px solid #2a2a2a', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', color: '#e0e0e0' }}>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 - FOOTER */}
      <footer style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a', padding: '48px 80px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '18px', color: '#fff', fontWeight: 600 }}>🧠 COS</div>
            <div style={{ fontSize: '13px', color: '#a1a1aa' }}>Cognitive Operating System</div>
            <div style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '8px' }}>Built with ❤️ by COS Team · HackCrux 2026</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['COS Personal', 'COS Teams', 'COS WorkSense'].map(item => (
              <div key={item} style={{ fontSize: '13px', color: '#a1a1aa', cursor: 'pointer' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#a1a1aa'}>{item}</div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Privacy Policy', 'Terms', 'Contact'].map(item => (
              <div key={item} style={{ fontSize: '13px', color: '#a1a1aa', cursor: 'pointer' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#a1a1aa'}>{item}</div>
            ))}
          </div>
          
        </div>
        
        <div style={{ textAlign: 'center', fontSize: '13px', color: '#a1a1aa', borderTop: '1px solid #1a1a1a', paddingTop: '24px', marginTop: '48px' }}>
          No CCTV. No screenshots. No keystrokes.<br/>
          Just cognitive patterns — private, local, yours.
        </div>
      </footer>
    </div>
  );
}
