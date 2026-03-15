import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusDot } from '../components/ui/StatusDot';
import { C, S, F, R } from '../design/tokens';

export default function EmployeeHome() {
  const navigate = useNavigate();
  const [name, setName] = useState('Employee');
  const [orgName, setOrgName] = useState('Acme Corp');
  const [empCode, setEmpCode] = useState('EMP-742');
  const [goals, setGoals] = useState(['Complete the auth module rewrite', 'Review Sarah\'s PR for API Gateway']);
  const [goalInput, setGoalInput] = useState('');
  const [score, setScore] = useState(87);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const NAV_ITEMS = [
    { id: 'home',      label: 'My Focus',      icon: '👔' },
    { id: 'timeline',  label: 'Timeline',      icon: '📅' },
    { id: 'intelligence', label: 'Intelligence', icon: '🧠' },
    { id: 'div',       label: '─────────────', icon: '' },
    { id: 'setup',     label: 'Account',       icon: '⚙️' },
  ];

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>
      <span style={{ color: C.teal }}>🏢</span> WorkSense
    </div>
  );

  const addGoal = () => {
    if (!goalInput.trim()) return;
    setGoals([...goals, goalInput.trim()]);
    setGoalInput('');
  };

  const removeGoal = (idx) => {
    setGoals(goals.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="home" 
        onSelect={(id) => { if (id !== 'div') navigate(`/${id}`) }} 
        logo={logo} 
        accent={C.teal} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title={`Good morning, ${name}`} 
          subtitle={`${orgName} · ${empCode}`}
          actions={<Badge color={C.teal} dot>Focus: {score}</Badge>}
          accent={C.teal} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          
          {/* Privacy Banner */}
          {isBannerVisible && (
            <div style={{ 
              background: `${C.teal}10`, border: `1px solid ${C.teal}40`, borderLeft: `4px solid ${C.teal}`,
              padding: '20px 24px', borderRadius: R.md, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: F.md, fontWeight: F.bold, color: C.textPrimary, marginBottom: '8px' }}>🔒 Protected by Neural Privacy</div>
                <p style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: 1.6 }}>
                  WorkSense is active. Your manager can see your <strong>context title</strong> and <strong>focus score</strong>. 
                  Individual keystrokes, screenshots, and private messages are <strong>never</strong> captured.
                </p>
              </div>
              <button 
                onClick={() => setIsBannerVisible(false)}
                style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '20px' }}
              >
                ×
              </button>
            </div>
          )}

          {/* ZONE 1: Focus Score */}
          <Card padding="32px" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: F.xs, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Focus Score</div>
            <div style={{ fontSize: '64px', fontWeight: F.black, color: score >= 75 ? C.success : C.amber }}>{score}</div>
            <div style={{ fontSize: F.sm, color: C.textSecondary }}>Trend: <span style={{ color: C.success }}>↑ +12</span> from yesterday</div>
          </Card>

          {/* ZONE 2: Goals */}
          <div>
            <h3 style={{ fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary, marginBottom: '16px' }}>Private Work Goals</h3>
            <Card padding="24px" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <Input 
                    placeholder="What are you focusing on right now?" 
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    accent={C.teal}
                  />
                </div>
                <Button variant="primary" onClick={addGoal} style={{ background: C.teal, borderColor: C.teal }}>Add Goal</Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {goals.map((g, i) => (
                  <div key={i} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '12px 16px', background: C.bgActive, borderRadius: R.sm, border: `1px solid ${C.borderLight}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px', opacity: 0.5 }}>☐</span>
                      <span style={{ fontSize: F.sm, color: C.textPrimary }}>{g}</span>
                    </div>
                    <button onClick={() => removeGoal(i)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontSize: F.sm }}>×</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ZONE 3: Coach and Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
             <div style={{ background: `${C.bgElevated}80`, padding: '24px', borderRadius: R.md, borderLeft: `3px solid ${C.teal}` }}>
                <div style={{ fontSize: F.xs, fontWeight: F.bold, color: C.teal, textTransform: 'uppercase', marginBottom: '8px' }}>💡 Neural Coach</div>
                <div style={{ fontSize: F.sm, color: C.textPrimary, lineHeight: 1.6 }}>
                  Your peak focus is between 10 AM and 12 PM. We've detected that Slack notifications often break your flow during this period. Try enabling Focus Mode.
                </div>
             </div>
             
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignContent: 'flex-start' }}>
                {['🔥 Top Performer', '🎯 Focus Master', '⚡ Deep Worker', '🌟 Streak King'].map((b, i) => (
                  <Badge key={i} color={i === 0 ? C.success : C.textMuted}>{b}</Badge>
                ))}
             </div>
          </div>

          {/* ZONE 4: Work Hours */}
          <Card padding="24px">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: F.sm, fontWeight: F.semibold, color: C.textPrimary }}>Cognitive Load Today</span>
              <span style={{ fontSize: F.sm, color: C.textSecondary }}>8.25h / 8h Rec.</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: C.bgActive, borderRadius: R.full, overflow: 'hidden' }}>
              <div style={{ width: '90%', height: '100%', background: C.success, borderRadius: R.full }} />
            </div>
          </Card>

        </main>
      </div>
    </div>
  );
}
