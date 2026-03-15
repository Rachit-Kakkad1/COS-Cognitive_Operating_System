import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatusDot } from '../components/ui/StatusDot';
import { C, S, F, R } from '../design/tokens';

export default function CoFounderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking member data
    setTimeout(() => {
      setData({
        id,
        name: id === '2' ? 'Sarah' : 'Mike',
        member_code: id === '2' ? 'SRH-77' : 'MK-09',
        last_active: '3 min ago',
        current_thread: "Finalizing the Stripe integration logic for the onboarding flow.",
        current_app: "VS Code",
        session_minutes: 42,
        focus_score: 87,
        unfinished_threads: [
          "Docker setup for staging environment",
          "Drafting API documentation for founders",
          "Reviewing frontend PR #142"
        ],
        most_connected_memory: "Q3 Strategy Document (Shared)"
      });
      setLoading(false);
    }, 800);
  }, [id]);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Live State',  icon: '⚡' },
    { id: 'handoff',   label: 'Handoff',     icon: '🤝' },
    { id: 'cofounder', label: 'Co-Founders', icon: '👥' },
    { id: 'div',       label: '─────────────', icon: '' },
    { id: 'settings',  label: 'Settings',    icon: '⚙️' },
  ];

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>
      <span style={{ color: C.amber }}>⚡</span> COS Teams
    </div>
  );

  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <GlobalStyles />
      <div style={{ color: C.textSecondary, fontSize: F.sm }}>Synchronizing cognitive view...</div>
    </div>
  );

  if (!data) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
      <GlobalStyles />
      <div style={{ color: C.textSecondary, fontSize: F.sm }}>Member session not found.</div>
      <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="cofounder" 
        onSelect={(id) => { if (id !== 'div') navigate(`/${id}`) }} 
        logo={logo} 
        accent={C.amber} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title={`Member Insight: ${data.name}`} 
          subtitle="Real-time access to shared cognitive state"
          actions={<StatusDot status="online" />}
          accent={C.amber} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: R.md, background: C.bgElevated, 
                border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px' 
              }}>
                👤
              </div>
              <div>
                <h2 style={{ fontSize: F['2xl'], fontWeight: F.bold, color: C.textPrimary }}>{data.name}</h2>
                <div style={{ fontSize: F.xs, color: C.textSecondary, fontFamily: F.mono, marginTop: '4px' }}>
                  {data.member_code} · Active {data.last_active}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: F.xs, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Focus Score</div>
              <div style={{ fontSize: F['3xl'], fontWeight: F.bold, color: C.amber }}>{data.focus_score}</div>
            </div>
          </div>

          <Card padding="32px" glow accent={C.amber} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ fontSize: F.xs, fontWeight: F.bold, color: C.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Active Cognitive Thread</div>
              <div style={{ fontSize: F.lg, fontWeight: F.semibold, color: C.textPrimary, lineHeight: 1.5 }}>
                {data.current_thread}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Badge color={C.amber}>{data.current_app}</Badge>
                <div style={{ fontSize: F.xs, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                   Duration: {data.session_minutes} min
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: '24px' }}>
              <div style={{ fontSize: F.xs, fontWeight: F.bold, color: C.textMuted, textTransform: 'uppercase', marginBottom: '12px' }}>Unfinished Streams</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.unfinished_threads.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: F.sm, color: C.textPrimary }}>
                    <span style={{ color: C.amber }}>•</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: '24px' }}>
              <div style={{ fontSize: F.xs, fontWeight: F.bold, color: C.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Shared Neural Anchors</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🧠</span>
                <span style={{ fontSize: F.sm, color: C.textPrimary, fontWeight: F.medium }}>{data.most_connected_memory}</span>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button fullWidth onClick={() => navigate('/handoff?send=true')} style={{ background: C.amber, color: '#000', borderColor: C.amber }}>🤝 Request Handoff</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>← Return to State</Button>
          </div>

        </main>
      </div>
    </div>
  );
}
