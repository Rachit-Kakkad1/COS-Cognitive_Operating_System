import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { C, S, F, R } from '../design/tokens';

export default function SystemHealth() {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(0);
  const [data, setData] = useState({
    cpu: 45, ram: 60, battery: 85,
    processes: [
      { id: 1, name: 'docker-desktop', cpu: 75, ram: 42, power: 88, killable: true },
      { id: 2, name: 'node (v8)', cpu: 12, ram: 18, power: 30, killable: true },
      { id: 3, name: 'windowserver', cpu: 8, ram: 4, power: 15, killable: false },
    ]
  });
  const [confirmKill, setConfirmKill] = useState(null);

  useEffect(() => {
    const int = setInterval(() => {
      setLastUpdated(0);
      setData(prev => ({
        ...prev,
        cpu: prev.cpu > 70 ? 40 : prev.cpu + Math.floor(Math.random() * 40),
        processes: prev.processes.map(p => p.id === 1 ? { ...p, cpu: prev.cpu > 70 ? 10 : 80 } : p).sort((a,b) => b.cpu - a.cpu)
      }));
    }, 5000);

    const tick = setInterval(() => setLastUpdated(s => s + 1), 1000);
    return () => { clearInterval(int); clearInterval(tick); };
  }, []);

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

  const getColor = (val) => val >= 75 ? C.danger : val >= 50 ? C.warning : C.success;
  const getPowerBadge = (val) => val >= 50 ? { c: C.danger, e: '🔴' } : val >= 25 ? { c: C.warning, e: '🟡' } : { c: C.success, e: '🟢' };

  const columns = [
    { key: 'id', label: '#', width: '40px' },
    { key: 'name', label: 'Process', width: '1fr' },
    { key: 'cpu', label: 'CPU %', width: '100px', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: F.xs }}>{val}%</span>
        <div style={{ width: '40px', height: '4px', background: C.bgElevated, borderRadius: R.full, overflow: 'hidden' }}>
          <div style={{ width: `${val}%`, height: '100%', background: getColor(val), transition: 'width 0.3s' }} />
        </div>
      </div>
    )},
    { key: 'ram', label: 'RAM %', width: '100px', render: (val) => <span style={{ fontSize: F.xs }}>{val}%</span> },
    { key: 'power', label: 'Power', width: '100px', render: (val) => {
      const b = getPowerBadge(val);
      return <Badge color={b.c}>{b.e} {val}</Badge>;
    }},
    { key: 'action', label: 'Action', width: '80px', render: (_, row) => {
      if (!row.killable || row.cpu <= 15) return null;
      if (confirmKill === row.id) {
        return (
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button variant="danger" size="sm" onClick={() => setConfirmKill(null)}>Yes</Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmKill(null)}>No</Button>
          </div>
        )
      }
      return <Button variant="danger" size="sm" onClick={() => setConfirmKill(row.id)}>Kill</Button>;
    }}
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar items={NAV_ITEMS} active="system" onSelect={(id) => navigate(`/${id}`)} logo={logo} accent={C.purple} />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="System Health" subtitle="Hardware telemetry & process management" accent={C.purple} />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          
          {/* SECTION 1: Overviews */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[{label: 'CPU Usage', val: data.cpu}, {label: 'Memory Usage', val: data.ram}, {label: 'Battery Impact', val: data.battery}].map(stat => (
              <Card key={stat.label} padding="24px" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                  <span style={{ fontSize: F['2xl'], fontWeight: F.bold, color: getColor(stat.val) }}>{stat.val}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: C.bgHover, borderRadius: R.full, overflow: 'hidden' }}>
                  <div style={{ width: `${stat.val}%`, height: '100%', background: getColor(stat.val), transition: 'width 0.5s', borderRadius: R.full }} />
                </div>
                {stat.val > 70 && <div style={{ fontSize: F.xs, color: C.danger, marginTop: '4px' }}>⚠️ High baseline utilization</div>}
              </Card>
            ))}
          </div>

          {/* SECTION 2: CPU Spike Banner */}
          <div style={{ height: '70px', transition: 'all 0.3s ease', opacity: data.cpu >= 70 ? 1 : 0, overflow: 'hidden' }}>
            {data.cpu >= 70 && (
              <div style={{ 
                background: `${C.danger}15`, padding: '16px 24px', borderRadius: R.md,
                border: `1px solid ${C.danger}40`, borderLeft: `4px solid ${C.danger}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                animation: 'pulse 2s infinite'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: F.md, fontWeight: F.bold, color: C.danger }}>High CPU Anomaly</div>
                    <div style={{ fontSize: F.sm, color: C.textSecondary }}>"{data.processes[0].name}" is consuming most resources and blocking indexing algorithms.</div>
                  </div>
                </div>
                <Button variant="danger" onClick={() => setConfirmKill(data.processes[0].id)}>Kill Process</Button>
              </div>
            )}
          </div>

          {/* SECTION 3: Process list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: F.md, fontWeight: F.semibold, color: C.textPrimary }}>Active Processes</h3>
              <div style={{ fontSize: F.xs, color: C.textSecondary, fontFamily: F.mono }}>Last updated: {lastUpdated}s ago</div>
            </div>
            <Table columns={columns} rows={data.processes} accent={C.purple} />
          </div>

        </main>
      </div>
    </div>
  );
}
