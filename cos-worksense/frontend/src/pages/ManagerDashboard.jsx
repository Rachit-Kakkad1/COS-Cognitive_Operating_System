import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { StatCard } from '../components/ui/StatCard';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatusDot } from '../components/ui/StatusDot';
import { C, S, F, R } from '../design/tokens';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [reportTab, setReportTab] = useState('hourly');
  const [drawerEmp, setDrawerEmp] = useState(null);

  useEffect(() => {
    // Mocking dashboard data
    const mockData = {
      org_name: "Acme Corp",
      team_score: 82,
      total_online: 12,
      summary: {
        deep_focus_count: 6,
        distracted_count: 3,
        off_task_count: 1
      },
      employees: [
        { emp_id: 1, emp_code: 'E-001', name: 'Alice Smith', current_app: 'Chrome', current_title: 'PR Review: Auth Module', focus_score: 92, context_switches: 2, session_minutes: 145, status: 'deep_focus', color: C.teal },
        { emp_id: 2, emp_code: 'E-002', name: 'Bob Johnson', current_app: 'VS Code', current_title: 'backend/server.py', focus_score: 74, context_switches: 8, session_minutes: 42, status: 'distracted', color: C.amber },
        { emp_id: 3, emp_code: 'E-003', name: 'Charlie Brown', current_app: 'Slack', current_title: 'General Channel', focus_score: 22, context_switches: 14, session_minutes: 12, status: 'off_task', color: C.danger },
      ]
    };
    setDashboard(mockData);
  }, []);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Overview',      icon: '🏢' },
    { id: 'matrix',    label: 'Focus Matrix',  icon: '📊' },
    { id: 'org',       label: 'Organization',  icon: '⚙️' },
    { id: 'div',       label: '─────────────', icon: '' },
    { id: 'setup',     label: 'Switch Org',    icon: '🔄' },
  ];

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>
      <span style={{ color: C.teal }}>🏢</span> WorkSense
    </div>
  );

  const columns = [
    { key: 'name', label: 'Employee', width: '25%', render: (_, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textPrimary }}>{row.name}</span>
        <span style={{ fontSize: F.xs, color: C.textMuted }}>{row.emp_code}</span>
      </div>
    )},
    { key: 'context', label: 'Current Context', width: '35%', render: (_, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: F.sm, color: C.textPrimary }}>{row.current_app}</span>
        <span style={{ fontSize: F.xs, color: C.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.current_title}</span>
      </div>
    )},
    { key: 'focus', label: 'Focus Score', width: '15%', render: (val, row) => (
       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
         <span style={{ fontSize: F.sm, fontWeight: F.bold, color: row.color }}>{row.focus_score}</span>
         <div style={{ width: '40px', height: '4px', background: C.bgActive, borderRadius: R.full, overflow: 'hidden' }}>
           <div style={{ width: `${row.focus_score}%`, height: '100%', background: row.color }} />
         </div>
       </div>
    )},
    { key: 'status', label: 'Status', width: '15%', render: (val, row) => (
      <Badge color={row.color} dot>{row.status.replace('_', ' ')}</Badge>
    )},
    { key: 'action', label: 'Details', width: '10%', render: (_, row) => (
      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDrawerEmp(row); }}>→</Button>
    )}
  ];

  const d = dashboard || {};
  const sum = d.summary || {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="dashboard" 
        onSelect={(id) => { if (id !== 'div') navigate(`/${id}`) }} 
        logo={logo} 
        accent={C.teal} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title={d.org_name || "Manager Dashboard"} 
          subtitle={`${d.total_online || 0} employees active in the neural mesh`}
          actions={<StatusDot status="online" />}
          accent={C.teal} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* ZONE 1: Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <StatCard label="Org Focus Score" value={d.team_score ? `${d.team_score}%` : '—'} accent={C.teal} trend="↑+4" />
            <StatCard label="Deep Focus"      value={sum.deep_focus_count?.toString() || '0'} sub="employees" accent={C.success} />
            <StatCard label="Distracted"      value={sum.distracted_count?.toString() || '0'} sub="employees" accent={C.amber} />
            <StatCard label="Off Task"        value={sum.off_task_count?.toString() || '0'} sub="employees" accent={C.danger} />
          </div>

          {/* ZONE 2: Employee Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: F.lg, fontWeight: F.semibold, color: C.textPrimary }}>Member Telemetry</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm">Export Data</Button>
                <Button variant="primary" size="sm" style={{ background: C.teal, borderColor: C.teal }}>Live View</Button>
              </div>
            </div>
            <Table 
              columns={columns} 
              rows={d.employees || []} 
              accent={C.teal}
              onRowClick={(row) => setDrawerEmp(row)}
            />
          </div>

          {/* ZONE 3: Productivity Reports */}
          <Card padding="24px">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['hourly', 'daily', 'weekly'].map(tab => (
                <button key={tab} 
                  onClick={() => setReportTab(tab)}
                  style={{ 
                    background: reportTab === tab ? C.tealDim : 'transparent',
                    border: `1px solid ${reportTab === tab ? C.teal : C.border}`,
                    color: reportTab === tab ? C.teal : C.textSecondary,
                    padding: '6px 14px', borderRadius: R.sm, cursor: 'pointer', fontSize: F.xs, fontWeight: F.semibold,
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ background: C.bgActive, borderRadius: R.md, padding: '20px', border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: F.sm, color: C.textSecondary, fontFamily: F.mono }}>
                 // Automated Productivity Analysis Engine
                 <br/>
                 [Analysis] Peak productivity for "{d.org_name}" occurred at 10:42 AM today.
                 <br/>
                 [Insight] Context switching is 15% lower than last Tuesday.
                 <br/>
                 [Prediction] Burnout risk for Engineering team is LOW.
              </div>
            </div>
          </Card>

        </main>
      </div>

      {/* Side Drawer for Employee Details */}
      {drawerEmp && (
        <div style={{ 
          position: 'fixed', top: 0, right: 0, width: '420px', height: '100vh', 
          background: C.bgElevated, borderLeft: `1px solid ${C.border}`, zIndex: 1000,
          padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: F.xl, fontWeight: F.bold, color: C.textPrimary }}>Employee Bio</h3>
            <button onClick={() => setDrawerEmp(null)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: C.bgActive, padding: '16px', borderRadius: R.md }}>
            <div style={{ width: '48px', height: '48px', background: C.bgHover, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>👤</div>
            <div>
              <div style={{ fontSize: F.md, fontWeight: F.bold, color: C.textPrimary }}>{drawerEmp.name}</div>
              <div style={{ fontSize: F.xs, color: C.textSecondary }}>{drawerEmp.emp_code}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div>
               <div style={{ fontSize: F.xs, color: C.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Active Thread</div>
               <div style={{ fontSize: F.sm, color: C.textPrimary, lineHeight: 1.5 }}>{drawerEmp.current_app} — {drawerEmp.current_title}</div>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               <div style={{ background: C.bgHover, padding: '12px', borderRadius: R.sm }}>
                 <div style={{ fontSize: F.xs, color: C.textMuted }}>Focus Score</div>
                 <div style={{ fontSize: F.lg, fontWeight: F.bold, color: drawerEmp.color }}>{drawerEmp.focus_score}</div>
               </div>
               <div style={{ background: C.bgHover, padding: '12px', borderRadius: R.sm }}>
                 <div style={{ fontSize: F.xs, color: C.textMuted }}>Context Switches</div>
                 <div style={{ fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>{drawerEmp.context_switches}</div>
               </div>
             </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <Button fullWidth variant="danger">Review Session Logs</Button>
            <Button fullWidth variant="secondary" style={{ marginTop: '8px' }} onClick={() => setDrawerEmp(null)}>Dismiss</Button>
          </div>
        </div>
      )}

    </div>
  );
}
