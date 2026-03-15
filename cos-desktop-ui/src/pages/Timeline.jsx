import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { FocusBar } from '../components/ui/FocusBar';
import { Badge } from '../components/ui/Badge';
import { C, S, F, R } from '../design/tokens';

export default function Timeline() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState({ 'Today': false, 'Yesterday': false, 'Older': true });

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

  const mockData = {
    'Today': [
      { id: 1, app: 'VS Code', title: 'React Performance Optimization', url: 'cos-desktop-ui/src/App.jsx', time: '10 mins ago', color: '#007acc', focus: 85, session: '42m' },
      { id: 2, app: 'Chrome', title: 'Stripe API Reference', url: 'stripe.com/docs/api', time: '1 hr ago', color: '#4285f4', focus: 75, session: '12m' },
      { id: 3, app: 'Slack', title: 'Engineering Channel - Deploy plan', url: 'slack.com/archives/...', time: '2 hrs ago', color: '#e01e5a', focus: 45, session: '8m' },
    ],
    'Yesterday': [
      { id: 4, app: 'Figma', title: 'New Dashboard Iteration 3', url: 'figma.com/file/...', time: 'Yesterday, 4:30 PM', color: '#f24e1e', focus: 92, session: '1h 15m' },
      { id: 5, app: 'Notion', title: 'Q3 OKRs Planning', url: 'notion.so/...', time: 'Yesterday, 2:00 PM', color: '#ffffff', focus: 88, session: '45m' },
    ],
    'Older': []
  };

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="timeline" 
        onSelect={(id) => navigate(`/${id}`)} 
        logo={logo} 
        accent={C.purple} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title="Cognitive Timeline" 
          subtitle="Your complete multi-modal historical memory"
          accent={C.purple} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input 
                icon="🔍"
                placeholder="Search memories by app, content, or context..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                accent={C.purple}
              />
            </div>
            <select style={{ 
              background: C.bgElevated, border: `1px solid ${C.border}`, color: C.textPrimary, 
              padding: '10px 16px', borderRadius: R.md, outline: 'none', cursor: 'pointer',
              fontFamily: F.family, fontSize: F.sm
            }}>
              <option>All Dates</option>
              <option>Past 24h</option>
              <option>Past Week</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '16px' }}>
            {Object.entries(mockData).map(([section, memories]) => {
              const count = memories.length;
              const isCollapsed = collapsed[section];

              return (
                <div key={section} style={{ display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Section Header */}
                  <div 
                    onClick={() => toggleSection(section)}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: R.md, background: C.bgActive,
                      cursor: 'pointer', transition: C.transition.fast,
                      borderBottom: isCollapsed ? `1px solid ${C.border}` : '1px solid transparent'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.bgActive}dd`}
                    onMouseLeave={e => e.currentTarget.style.background = C.bgActive}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: C.textMuted }}>{isCollapsed ? '▶' : '▼'}</span>
                      <span style={{ fontSize: F.md, fontWeight: F.semibold, color: C.textPrimary }}>{section}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Badge color={C.purple}>{count} memories</Badge>
                      <span style={{ fontSize: F.xs, color: C.textSecondary, cursor: 'pointer' }} onClick={e => e.stopPropagation()}>Export ↓</span>
                    </div>
                  </div>

                  {/* Section Content */}
                  {!isCollapsed && (
                    <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {count === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontSize: F.sm }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗃️</div>
                          No memories yet for this period
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '12px' }}>
                          {memories.map(m => (
                            <Card 
                              key={m.id} 
                              padding="16px" 
                              onClick={() => {}} 
                              style={{ 
                                display: 'flex', flexDirection: 'column', gap: '12px',
                                borderLeft: `3px solid ${m.color}`
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color }} />
                                  <span style={{ fontSize: F.xs, fontWeight: F.bold, color: C.textSecondary }}>{m.app}</span>
                                </div>
                                <span style={{ fontSize: F.xs, color: C.textMuted }}>{m.time}</span>
                              </div>
                              
                              <div>
                                <div style={{ fontSize: F.md, fontWeight: F.semibold, color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {m.title}
                                </div>
                                <div style={{ fontSize: F.xs, color: C.textSecondary, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: F.mono }}>
                                  {m.url}
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: F.xs, fontWeight: F.bold, color: m.focus >= 75 ? C.success : m.focus >= 50 ? C.warning : C.danger }}>{m.focus}</span>
                                  <FocusBar score={m.focus} size="sm" />
                                </div>
                                <span style={{ fontSize: F.xs, color: C.textMuted, fontFamily: F.mono }}>
                                  {m.session} session
                                </span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
}
