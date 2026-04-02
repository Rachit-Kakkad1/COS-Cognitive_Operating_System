import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { C, S, F, R } from '../design/tokens';

const ModeSelector = () => {
  const { MODES, selectMode } = useMode();
  const navigate = useNavigate();
  const [personalizing, setPersonalizing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSelect = async (modeId) => {
    setPersonalizing(true);
    selectMode(modeId);

    try {
      const res = await fetch('http://localhost:8000/role/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: modeId })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('cos_role_token', data.token);
      }
    } catch (e) {
      console.warn('[Role] Backend save failed — using local only');
    }

    let p = 0;
    const int = setInterval(() => {
      p += 15;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(int);
        setTimeout(() => navigate('/home'), 200);
      }
    }, 150);
  };

  if (personalizing) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: C.bg
      }}>
        <GlobalStyles />
        <div style={{ fontSize: '48px', animation: 'pulse 1.5s infinite' }}>🧠</div>
        <h2 style={{ color: C.textPrimary, marginTop: '24px', fontWeight: F.bold, fontSize: F.xl }}>Personalizing COS for you...</h2>
        <div style={{ width: '320px', height: '4px', background: C.bgActive, borderRadius: R.full, marginTop: '24px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <div style={{ width: `${progress}%`, height: '100%', background: C.purple, transition: 'width 0.15s linear' }} />
        </div>
        <style>{`
          @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  const modeData = [
    { id: 'professional', label: 'Professional', icon: '👔', accent: C.purple, pills: ['Context Recall', 'Voice AI', 'Cognitive Graph'], desc: 'Precision tools for developers, founders, and knowledge workers.' },
    { id: 'student',      label: 'Student',      icon: '🎓', accent: C.teal,   pills: ['Study Tracker', 'Exam Countdown', 'Streak'], desc: 'Focused environment for academic excellence and deep learning.' },
    { id: 'parent',       label: 'Parent',       icon: '🛡️', accent: C.success, pills: ['Child Monitor', 'Screen Time', 'Safe Browsing'], desc: 'Command center to protect and monitor your family digital wellbeing.' },
    { id: 'child',        label: 'Child',        icon: '🌈', accent: C.amber,   pills: ['Fun Timer', 'Rewards', 'Safe Mode'], desc: 'A safe, engaging, and filtered space for children to explore.' },
    { id: 'senior',       label: 'Senior',       icon: '🦳', accent: C.textSecondary, pills: ['Memory Help', 'Voice First', 'Simple UI'], desc: 'Simplified interface with prioritized cognitive assistance.' },
    { id: 'employee',      label: 'Employee',      icon: '💼', accent: C.tealDim, pills: ['Performance', 'Burnout Alert', 'Daily Goals'], desc: 'Enterprise-grade focus tracking for professional growth.' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: C.bg, 
      padding: '80px 40px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      animation: 'fadeIn 0.5s ease'
    }}>
      <GlobalStyles />
      
      <div style={{ textAlign: 'center', marginBottom: '72px', maxWidth: '600px' }}>
        <div style={{ 
          display: 'inline-flex', padding: '12px', background: C.bgElevated, 
          borderRadius: R.md, border: `1px solid ${C.border}`, marginBottom: '24px',
          boxShadow: `0 8px 32px ${C.bgActive}`
        }}>
          <span style={{ fontSize: '32px' }}>🧠</span>
        </div>
        <h1 style={{ 
          color: C.textPrimary, fontSize: '42px', fontWeight: F.black, 
          letterSpacing: '-0.02em', marginBottom: '16px', lineHeight: 1.1 
        }}>
          Welcome to COS
        </h1>
        <p style={{ color: C.textSecondary, fontSize: F.lg, lineHeight: 1.5 }}>
          Select the mode that best fits your workflow. 
          Each environment is precision-engineered for specific cognitive needs.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '32px', 
        maxWidth: '1100px', 
        width: '100%' 
      }}>
        {modeData.map((m) => (
          <ModeCard 
            key={m.id}
            label={m.label}
            desc={m.desc}
            icon={m.icon}
            accent={m.accent}
            pills={m.pills}
            onSelect={() => handleSelect(m.id)}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

const ModeCard = ({ label, desc, icon, accent, pills, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      glow={isHovered} 
      accent={accent} 
      padding="0"
      style={{ 
        cursor: 'pointer', 
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'translateY(-8px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '320px'
      }}
      onClick={onSelect}
    >
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div style={{ 
          width: '56px', height: '56px', borderRadius: R.md, 
          display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px',
          marginBottom: '24px', border: `1px solid ${C.borderLight}`,
          transition: 'all 0.3s ease',
          background: isHovered ? `${accent}15` : C.bgActive,
          borderColor: isHovered ? `${accent}40` : C.borderLight
        }}>
          {icon}
        </div>
        
        <h3 style={{ 
          fontSize: F.xl, fontWeight: F.bold, color: C.textPrimary, 
          marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' 
        }}>
          {label}
        </h3>
        
        <p style={{ 
          fontSize: F.sm, color: C.textSecondary, lineHeight: 1.6, 
          marginBottom: '24px', flex: 1 
        }}>
          {desc}
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {pills.map(p => (
            <Badge key={p} color={isHovered ? accent : C.textMuted} dot={isHovered}>
              {p}
            </Badge>
          ))}
        </div>

        <Button 
          fullWidth 
          variant={isHovered ? 'primary' : 'secondary'}
          style={{ 
            background: isHovered ? accent : 'transparent',
            borderColor: isHovered ? accent : C.border,
            color: isHovered ? (accent === C.amber || accent === C.textSecondary ? '#000' : '#fff') : C.textPrimary,
            fontWeight: F.bold
          }}
        >
          Initialize {label}
        </Button>
      </div>
    </Card>
  );
};

export default ModeSelector;
