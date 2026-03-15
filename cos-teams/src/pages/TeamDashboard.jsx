import React, { useState } from 'react';
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

  const NAV_ITEMS = [
    { id: '',          label: 'Live State',  icon: '⚡' },
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

  const teamMembers = [
    { id: 1, name: 'Alex (You)', focus: 'Pitch Deck v4', status: 'Synced', color: C.success },
    { id: 2, name: 'Sarah', focus: 'API Gateway', status: 'Syncing', color: C.warning },
    { id: 3, name: 'Mike', focus: 'Offline', status: '2h ago', color: C.danger },
  ];

  const columns = [
    { key: 'name', label: 'Member', width: '25%' },
    { key: 'focus', label: 'Current Focus', width: '35%', render: (val) => <span style={{ fontFamily: F.mono, fontSize: F.sm }}>{val}</span> },
    { key: 'status', label: 'Sync Status', width: '25%', render: (_, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusDot status={row.color === C.success ? 'online' : row.color === C.warning ? 'away' : 'offline'} />
        <span style={{ fontSize: F.sm, color: row.color, fontWeight: F.medium }}>{row.status}</span>
      </div>
    )},
    { key: 'action', label: 'Action', width: '15%', render: (_, row) => {
      if (row.name === 'Alex (You)') return <span style={{ color: C.textMuted }}>-</span>;
      if (row.name === 'Sarah') return <Button size="sm" variant="ghost" accent={C.amber}>Ping</Button>;
      return <Button size="sm" variant="ghost" accent={C.amber}>Wake</Button>;
    }}
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="" 
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
            <StatCard label="Team Sync Rate" value="94%" accent={C.amber} />
            <StatCard label="Active Contexts" value="12" accent={C.teal} />
            <StatCard label="Handoffs Saved" value="4.2h" accent={C.purple} />
          </div>

          {/* SECTION 2: Live Team State Table */}
          <div>
            <h3 style={{ fontSize: F.lg, fontWeight: F.semibold, color: C.textPrimary, marginBottom: '16px' }}>Squad Telemetry</h3>
            <Table columns={columns} rows={teamMembers} accent={C.amber} />
          </div>

        </main>
      </div>
    </div>
  );
}
