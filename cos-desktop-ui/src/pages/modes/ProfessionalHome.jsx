import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../../components/ui/GlobalStyles';
import { Sidebar } from '../../components/ui/Sidebar';
import { TopBar } from '../../components/ui/TopBar';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { C, S, F, R } from '../../design/tokens';

export default function ProfessionalHome() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [lastCap, setLastCap] = useState(2);

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    const lc = setInterval(() => {
      setLastCap(prev => prev < 5 ? prev + 1 : 1);
    }, 60000);
    return () => { clearInterval(t); clearInterval(lc); };
  }, []);

  const NAV_ITEMS = [
    { id: 'home',     label: 'Home',     icon: '🧠' },
    { id: 'ask',      label: 'Ask COS',  icon: '🎤' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'graph',    label: 'Graph',    icon: '🕸️' },
    { id: 'focus',    label: 'Focus',    icon: '📊' },
    { id: 'system',   label: 'System',   icon: '⚡' },
  ];

  const SECONDARY_NAV = [
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'mode-select', label: 'Switch Mode', icon: '🔄' },
  ];

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>
      <span>🧠</span> COS
    </div>
  );

  const topBarActions = (
    <>
      <Badge color={C.success} dot>Focus: 87</Badge>
      <StatusDot status="online" />
      <span style={{ fontSize: '16px', cursor: 'pointer', marginLeft: '8px' }}>☀️</span>
    </>
  );

  // Recent memories mock data
  const memories = [
    { id: 1, app: 'Chrome', title: 'Stripe API Logs - Dashboard', time: '2m ago', color: '#4285f4' },
    { id: 2, app: 'VS Code', title: 'backend/auth/fastapi_auth.py', time: '14m ago', color: '#007acc' },
    { id: 3, app: 'Notion', title: 'Q3 Product Strategy - Draft', time: '1h ago', color: '#ffffff' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={[...NAV_ITEMS, {id: 'div', label: '─────────────', icon: ''}, ...SECONDARY_NAV]} 
        active="home" 
        onSelect={(id) => {
          if(id === 'div') return;
          navigate(`/${id}`);
        }} 
        logo={logo} 
        accent={C.purple} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title={`Good morning, ${time}`} 
          actions={topBarActions} 
          accent={C.purple} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* ZONE 1 - Top Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <StatCard label="Memories Today" value="47"          icon="🧠" accent={C.purple} />
            <StatCard label="Focus Score"    value="87"          icon="📊" accent={C.success} trend="↑+12" />
            <StatCard label="Deep Focus"     value="2h 14m"      icon="⏱️" accent={C.teal} />
            <StatCard label="Context Switch" value="8"           icon="🔄" accent={C.amber} />
          </div>

          {/* ZONE 2 - Memories and Quick Actions */}
          <div style={{ display: 'flex', gap: '32px' }}>
            
            {/* Recent Memories (60%) */}
            <div style={{ flex: '6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: F.md, fontWeight: F.semibold, color: C.textPrimary }}>Recent Memories</h3>
                <span onClick={() => navigate('/timeline')} style={{ fontSize: F.xs, color: C.purple, cursor: 'pointer', fontWeight: F.semibold }}>View all →</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {memories.map(m => (
                  <Card key={m.id} padding="16px" radius="10px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `3px solid ${m.color}`, cursor: 'pointer' }}
                    onClick={() => navigate('/timeline')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color }} />
                      <Badge color={m.color}>{m.app}</Badge>
                      <span style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textPrimary }}>{m.title}</span>
                    </div>
                    <span style={{ fontSize: F.xs, color: C.textSecondary }}>{m.time}</span>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions (40%) */}
            <div style={{ flex: '4' }}>
              <h3 style={{ fontSize: F.md, fontWeight: F.semibold, color: C.textPrimary, marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repaet(2, 1fr)', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Card style={{ flex: 1, padding: '20px' }} onClick={() => navigate('/ask')} glow accent={C.purple}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎤</div>
                    <div style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textPrimary }}>Ask COS <span style={{color: C.textSecondary}}>→</span></div>
                  </Card>
                  <Card style={{ flex: 1, padding: '20px' }} onClick={() => navigate('/focus')} glow accent={C.teal}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                    <div style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textPrimary }}>Focus Report <span style={{color: C.textSecondary}}>→</span></div>
                  </Card>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Card style={{ flex: 1, padding: '20px' }} onClick={() => navigate('/graph')} glow accent="#8b5cf6">
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🕸️</div>
                    <div style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textPrimary }}>View Graph <span style={{color: C.textSecondary}}>→</span></div>
                  </Card>
                  <Card style={{ flex: 1, padding: '20px' }} onClick={() => navigate('/system')} glow accent={C.amber}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                    <div style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textPrimary }}>System Health <span style={{color: C.textSecondary}}>→</span></div>
                  </Card>
                </div>
              </div>
            </div>
            
          </div>

          {/* ZONE 3 - Today's Summary */}
          <div style={{ background: C.bgActive, borderRadius: R.md, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: F.sm, color: C.textPrimary, fontWeight: F.medium }}>
              Today: 47 memories · 2h 14m deep focus · 8 switches
            </div>
            <div style={{ fontSize: F.xs, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Last captured: {lastCap} min ago <StatusDot status="online" />
            </div>
          </div>

          {/* ZONE 4 - Mini Graph */}
          <div style={{ flex: 1, position: 'relative', border: `1px solid ${C.border}`, borderRadius: R.md, background: '#0a0a14', minHeight: '300px', overflow: 'hidden' }}>
            {/* FAKE COMPONENT for 3D Graph */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '200px', height: '100px' }}>
                 {/* Fake nodes */}
                 <div style={{ position: 'absolute', top: '10%', left: '20%', width: 12, height: 12, background: C.purple, borderRadius: '50%', boxShadow: `0 0 10px ${C.purple}` }} />
                 <div style={{ position: 'absolute', top: '80%', left: '40%', width: 16, height: 16, background: C.purple, borderRadius: '50%', boxShadow: `0 0 10px ${C.purple}` }} />
                 <div style={{ position: 'absolute', top: '40%', left: '80%', width: 10, height: 10, background: C.purple, borderRadius: '50%', boxShadow: `0 0 10px ${C.purple}` }} />
                 {/* Fake edges */}
                 <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                   <line x1="25%" y1="15%" x2="45%" y2="85%" stroke={C.teal} strokeWidth="2" opacity="0.6" />
                   <line x1="45%" y1="85%" x2="82%" y2="45%" stroke={C.teal} strokeWidth="2" opacity="0.6" />
                 </svg>
               </div>
               <span style={{ fontSize: F.sm, color: C.textMuted, fontFamily: F.mono }}>[WebGL Context Visualizer]</span>
            </div>

            <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
              <Button variant="ghost" onClick={() => navigate('/graph')}>View full graph →</Button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
