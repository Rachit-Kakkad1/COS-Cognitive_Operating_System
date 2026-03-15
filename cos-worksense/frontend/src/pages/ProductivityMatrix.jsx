import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { FocusBar } from '../components/ui/FocusBar';
import { C, S, F, R } from '../design/tokens';

export default function ProductivityMatrix() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    // Mocking matrix data
    const mockData = {
      team_average: 78,
      employees: [
        { name: 'Alice Smith', emp_code: 'E-001', productivity_score: 92, score_class: 'green', improvement_tip: "Peak performance detected. Capacity available for high-complexity tasks.", metrics: { avg_focus_score: 88, avg_context_switches: 2, avg_session_minutes: 120, idle_percentage: 5 } },
        { name: 'Bob Johnson', emp_code: 'E-002', productivity_score: 74, score_class: 'yellow', improvement_tip: "Focus duration is declining. Recommend scheduling neural recovery intervals.", metrics: { avg_focus_score: 72, avg_context_switches: 6, avg_session_minutes: 45, idle_percentage: 12 } },
        { name: 'Charlie Brown', emp_code: 'E-003', productivity_score: 42, score_class: 'red', improvement_tip: "High context switching detected. Suggest blocking administrative tool notifications.", metrics: { avg_focus_score: 45, avg_context_switches: 14, avg_session_minutes: 15, idle_percentage: 25 } },
      ]
    };
    setData(mockData);
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

  const getStatusColor = (cls) => cls === 'green' ? C.success : cls === 'yellow' ? C.amber : C.danger;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="matrix" 
        onSelect={(id) => { if (id !== 'div') navigate(`/${id}`) }} 
        logo={logo} 
        accent={C.teal} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title="Productivity Matrix" 
          subtitle="Deep-dive neural analytics and improvement plans"
          accent={C.teal} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StatCard label="Team Average Score" value={data?.team_average ? `${data.team_average}/100` : '—'} accent={C.teal} trend="↑ +4.2% week-over-week" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {data?.employees.map((emp, i) => {
              const color = getStatusColor(emp.score_class);
              return (
                <Card key={i} padding="24px" style={{ borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.bgActive, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px' }}>👤</div>
                      <div>
                        <div style={{ fontSize: F.md, fontWeight: F.bold, color: C.textPrimary }}>{emp.name}</div>
                        <div style={{ fontSize: F.xs, color: C.textMuted }}>{emp.emp_code}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: F.xs, color: C.textMuted, textTransform: 'uppercase' }}>Weighted Score</div>
                       <div style={{ fontSize: F.xl, fontWeight: F.bold, color }}>{emp.productivity_score}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ background: C.bgActive, padding: '12px', borderRadius: R.sm }}>
                       <div style={{ fontSize: F.xs, color: C.textMuted, marginBottom: '4px' }}>Focus Score</div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <span style={{ fontSize: F.sm, fontWeight: F.bold, color: C.textPrimary }}>{emp.metrics.avg_focus_score}%</span>
                         <FocusBar score={emp.metrics.avg_focus_score} size="sm" />
                       </div>
                    </div>
                    <div style={{ background: C.bgActive, padding: '12px', borderRadius: R.sm }}>
                       <div style={{ fontSize: F.xs, color: C.textMuted, marginBottom: '4px' }}>Context Switches</div>
                       <div style={{ fontSize: F.sm, fontWeight: F.bold, color: C.textPrimary }}>{emp.metrics.avg_context_switches}/hr</div>
                    </div>
                    <div style={{ background: C.bgActive, padding: '12px', borderRadius: R.sm }}>
                       <div style={{ fontSize: F.xs, color: C.textMuted, marginBottom: '4px' }}>Avg Session</div>
                       <div style={{ fontSize: F.sm, fontWeight: F.bold, color: C.textPrimary }}>{Math.round(emp.metrics.avg_session_minutes)}m</div>
                    </div>
                    <div style={{ background: C.bgActive, padding: '12px', borderRadius: R.sm }}>
                       <div style={{ fontSize: F.xs, color: C.textMuted, marginBottom: '4px' }}>Idle State</div>
                       <div style={{ fontSize: F.sm, fontWeight: F.bold, color: C.textPrimary }}>{emp.metrics.idle_percentage}%</div>
                    </div>
                  </div>

                  <div style={{ background: `${C.teal}08`, borderLeft: `2px solid ${C.teal}`, padding: '12px 16px', borderRadius: R.sm }}>
                     <div style={{ fontSize: F.xs, color: C.teal, fontWeight: F.bold, textTransform: 'uppercase', marginBottom: '4px' }}>Engine Insight</div>
                     <div style={{ fontSize: F.sm, color: C.textPrimary, fontStyle: 'italic' }}>"{emp.improvement_tip}"</div>
                  </div>
                </Card>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
}
