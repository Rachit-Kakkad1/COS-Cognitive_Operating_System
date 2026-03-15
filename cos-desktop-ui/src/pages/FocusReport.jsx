import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { C, S, F, R } from '../design/tokens';

export default function FocusReport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Today');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger animation
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, [activeTab]);

  const NAV_ITEMS = [
    { id: 'home',     label: 'Home',     icon: '🧠' },
    { id: 'ask',      label: 'Ask COS',  icon: '🎤' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'graph',    label: 'Graph',    icon: '🕸️' },
    { id: 'focus',    label: 'Focus',    icon: '📊' },
    { id: 'system',   label: 'System',   icon: '⚡' },
  ];

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>
      <span>🧠</span> COS
    </div>
  );

  const score = 87;
  const prodPct = 74;
  const unprodPct = 26;

  const scoreColor = score >= 75 ? C.success : score >= 50 ? C.amber : C.danger;
  
  // SVG Arc Math
  const radius = 90;
  const circumference = radius * Math.PI; // semi-circle
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="focus" 
        onSelect={(id) => navigate(`/${id}`)} 
        logo={logo} 
        accent={C.purple} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title="Cognitive Focus Report" 
          subtitle="Data-driven productivity analysis"
          accent={C.purple} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          
          {/* TABS */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
            {['Today', 'This Week', 'This Month'].map(tab => (
              <button key={tab} 
                onClick={() => { setMounted(false); setActiveTab(tab); }}
                style={{ 
                  background: 'transparent', border: 'none', 
                  fontSize: F.sm, fontWeight: activeTab === tab ? F.semibold : F.medium,
                  color: activeTab === tab ? C.purple : C.textSecondary,
                  padding: '8px 16px', cursor: 'pointer', transition: C.transition.fast,
                  borderBottom: activeTab === tab ? `2px solid ${C.purple}` : '2px solid transparent',
                  marginBottom: '-17px' // overlay the bottom border
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SECTION 1: Arc Gauge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <div style={{ position: 'relative', width: '220px', height: '110px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <svg width="220" height="110" style={{ position: 'absolute', top: 0 }}>
                {/* Background Arc */}
                <path 
                  d="M 20 100 A 90 90 0 0 1 200 100" 
                  fill="none" stroke={C.border} strokeWidth="16" strokeLinecap="round" 
                />
                {/* Colored Foreground Arc */}
                <path 
                  d="M 20 100 A 90 90 0 0 1 200 100" 
                  fill="none" stroke={scoreColor} strokeWidth="16" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={mounted ? dashoffset : circumference}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
              </svg>
              <div style={{ position: 'absolute', bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '48px', fontWeight: F.black, color: C.textPrimary, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: F.sm, color: C.textSecondary, fontWeight: F.medium, marginTop: '4px' }}>Focus Score</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Animated Bars */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: F.sm, fontWeight: F.semibold }}>
                <span style={{ color: C.textPrimary }}>Productive Time</span>
                <span style={{ color: C.textPrimary }}>{prodPct}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: C.bgElevated, borderRadius: R.full, overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', background: C.purple, borderRadius: R.full,
                  width: mounted ? `${prodPct}%` : '0%', transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: F.sm, fontWeight: F.semibold }}>
                <span style={{ color: C.textSecondary }}>Unproductive Time</span>
                <span style={{ color: C.textSecondary }}>{unprodPct}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: C.bgElevated, borderRadius: R.full, overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', background: C.borderLight, borderRadius: R.full,
                  width: mounted ? `${unprodPct}%` : '0%', transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
                }} />
              </div>
            </div>
          </Card>

          {/* SECTION 3: Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <StatCard label="Deep Focus" value="2h 14m" icon="⏱️" accent={C.purple} />
            <StatCard label="Context Switch" value="8" sub="/hr" icon="🔄" accent={C.textSecondary} />
            <StatCard label="Flow Sessions" value="2" icon="🌊" accent={C.teal} />
            <StatCard label="Max Interruption" value="14m" trend="-2m" icon="🛑" accent={C.success} />
          </div>

          {/* SECTION 4: Badges */}
          <div>
            <h3 style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textPrimary, marginBottom: '16px' }}>Detected during unproductive time:</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Badge color={C.danger}>Twitter (14m)</Badge>
              <Badge color={C.danger}>HackerNews (8m)</Badge>
              <Badge color={C.danger}>Reddit (4m)</Badge>
            </div>
          </div>

          {/* SECTION 5: Coach Recommendation */}
          <div style={{ 
            background: `${C.bgElevated}80`, borderRadius: R.md, padding: '20px 24px',
            borderLeft: `3px solid ${C.purple}`, marginTop: '16px'
          }}>
            <div style={{ fontSize: F.xs, fontWeight: F.bold, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              💡 COS Coach:
            </div>
            <div style={{ fontSize: F.md, color: C.textPrimary, lineHeight: 1.6 }}>
              You often lose context around 2:30 PM. Try taking a preemptive 10-minute break before jumping into deep work in the afternoon. Overall, your context switching has decreased by 12% this week. Keep it up.
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
