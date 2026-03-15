import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { C, S, F, R } from '../design/tokens';

export default function OrgSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState('');
  const [yourName, setYourName] = useState('');
  const [teamSize, setTeamSize] = useState(10);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    // Mocking creation
    setTimeout(() => {
      setCredentials({
        org_code: company.toUpperCase().replace(/\s/g, '-') + '-2026',
        manager_token: 'mock-token-123',
        employees: [
          { emp_code: 'EMP-001', temp_password: 'pass-' + Math.random().toString(36).substr(2, 5) },
          { emp_code: 'EMP-002', temp_password: 'pass-' + Math.random().toString(36).substr(2, 5) },
          { emp_code: 'EMP-003', temp_password: 'pass-' + Math.random().toString(36).substr(2, 5) },
        ]
      });
      setStep(3);
      setLoading(false);
    }, 1500);
  };

  const goDashboard = () => {
    localStorage.setItem('ws_manager_token', credentials.manager_token);
    localStorage.setItem('ws_org_name', credentials.org_code);
    navigate('/dashboard');
  };

  const columns = [
    { key: 'emp_code', label: 'Employee Code', width: '1fr' },
    { key: 'temp_password', label: 'Temp Password', width: '1fr' },
    { key: 'action', label: '', width: '80px', render: (_, row) => (
      <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(`${row.emp_code} / ${row.temp_password}`)}>Copy</Button>
    )}
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
      <GlobalStyles />

      <div style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
          <h1 style={{ fontSize: F['3xl'], fontWeight: F.black, color: C.textPrimary, marginBottom: '8px' }}>WorkSense Setup</h1>
          <p style={{ fontSize: F.sm, color: C.textSecondary }}>Establish your organization's neural presence</p>
        </div>

        {step === 1 && (
          <Card padding="32px" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>Step 1: Company Profile</h2>
               <Badge color={C.teal}>1 of 3</Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Company Name" placeholder="e.g. Acme Industries" value={company} onChange={e => setCompany(e.target.value)} />
              <Input label="Your Name" placeholder="e.8. John Doe" value={yourName} onChange={e => setYourName(e.target.value)} />
              <div>
                <label style={{ display: 'block', fontSize: F.xs, fontWeight: F.bold, color: C.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Team Size: {teamSize}</label>
                <input type="range" min={2} max={100} value={teamSize} onChange={e => setTeamSize(Number(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            </div>
            <Button fullWidth onClick={() => setStep(2)} disabled={!company || !yourName}>Next →</Button>
          </Card>
        )}

        {step === 2 && (
          <Card padding="32px" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>Step 2: Manager Account</h2>
               <Badge color={C.teal}>2 of 3</Badge>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input type="email" placeholder="Manager Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <Input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              {error && <p style={{ color: C.danger, fontSize: F.xs }}>{error}</p>}
              <Button fullWidth disabled={loading}>{loading ? 'Initializing Mesh...' : 'Create Organization'}</Button>
              <Button fullWidth variant="ghost" onClick={() => setStep(1)}>Back</Button>
            </form>
          </Card>
        )}

        {step === 3 && (
          <Card padding="32px" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <h2 style={{ fontSize: F.xl, fontWeight: F.bold, color: C.textPrimary }}>Organization Ready</h2>
              <p style={{ fontSize: F.xs, color: C.textSecondary }}>Distribute these credentials to your team members</p>
            </div>

            <Table columns={columns} rows={credentials.employees} accent={C.teal} />

            <div style={{ background: C.bgActive, padding: '16px', borderRadius: R.md, border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: F.xs, fontWeight: F.bold, color: C.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Onboarding Guide</div>
              <ol style={{ fontSize: F.xs, color: C.textSecondary, paddingLeft: '16px', lineHeight: 1.6 }}>
                <li>Distribute codes and passwords to employees via private channel.</li>
                <li>Ask team to install the WorkSense browser extension.</li>
                <li>Monitor live focus state on your Manager Dashboard.</li>
              </ol>
            </div>

            <Button fullWidth onClick={goDashboard}>Go to Dashboard →</Button>
          </Card>
        )}

        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: F.xs, color: C.textMuted, marginBottom: '12px' }}>Already have account?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button fullWidth variant="secondary" onClick={() => navigate('/dashboard')}>Manager Login</Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/home')}>Employee Login</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
