import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { StatCard } from '../components/ui/StatCard';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { StatusDot } from '../components/ui/StatusDot';
import { C, S, F, R } from '../design/tokens';

export default function TeamDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const founderToken = localStorage.getItem('cos_teams_founder_token');

  useEffect(() => {
    // Mocking the fetch logic from the previous implementation
    const fetchMembers = () => {
      const mockMembers = [
        { id: 1, name: 'Alex (You)', current_app: 'Chrome', current_title: 'Pitch Deck v4', focus_score: 94, context_switches: 2, status: 'focused', color: C.success },
        { id: 2, name: 'Sarah', current_app: 'VS Code', current_title: 'API Gateway', focus_score: 82, context_switches: 4, status: 'distracted', color: C.warning },
        { id: 3, name: 'Mike', current_app: 'Slack', current_title: 'Offline', focus_score: 0, context_switches: 0, status: 'idle', color: C.danger },
      ];
      setMembers(mockMembers);
      setLastUpdated(new Date());
    };
    fetchMembers();
    const t = setInterval(fetchMembers, 5000);
    return () => clearInterval(t);
  }, []);

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

  const columns = [
    { key: 'name', label: 'Member', width: '25%' },
    { key: 'focus', label: 'Current Focus', width: '35%', render: (_, row) => (
      <span style={{ fontFamily: F.mono, fontSize: F.sm, color: C.textPrimary }}>
        {row.current_app} — {row.current_title}
      </span>
    )},
    { key: 'status', label: 'Sync Status', width: '25%', render: (_, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusDot status={row.status} />
        <span style={{ fontSize: F.sm, color: row.color, fontWeight: F.medium }}>{row.status === 'focused' ? 'Synced' : row.status === 'distracted' ? 'Syncing' : '2h ago'}</span>
      </div>
    )},
    { key: 'action', label: 'Action', width: '15%', render: (_, row) => {
      if (row.name === 'Alex (You)') return <span style={{ color: C.textMuted }}>-</span>;
      return <Button size="sm" variant="ghost" style={{ color: C.amber, borderColor: C.amberDim }}>Ping</Button>;
    }}
  ];

  const avg = members.length ? Math.round(members.reduce((a, m) => a + (m.focus_score || 0), 0) / members.length) : 0;
  const activeContexts = members.filter(m => m.status !== 'idle').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="dashboard" 
        onSelect={(id) => { if (id !== 'div') navigate(`/${id}`) }} 
        logo={logo} 
        accent={C.amber} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title="Team State" 
          subtitle="Real-time cognitive synchronization"
          actions={<StatusDot status="online" />}
          accent={C.amber} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          
          {/* SECTION 1: Overview Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <StatCard label="Team Sync Rate" value={`${avg}%`} accent={C.amber} />
            <StatCard label="Active Contexts" value={activeContexts.toString()} accent={C.teal} />
            <StatCard label="Handoffs Saved" value="4.2h" accent={C.purple} />
          </div>

          {/* SECTION 2: Live Team State Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: F.lg, fontWeight: F.semibold, color: C.textPrimary }}>Squad Telemetry</h3>
              <span style={{ fontSize: F.xs, color: C.textSecondary, fontFamily: F.mono }}>
                Last updated: {lastUpdated ? `${Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago` : '—'}
              </span>
            </div>
            <Table 
              columns={columns} 
              rows={members} 
              onRowClick={(row) => navigate(`/cofounder/${row.id}`)}
              accent={C.amber} 
            />
          </div>

        </main>
      </div>
    </div>
  );
}
