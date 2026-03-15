import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GlobalStyles } from '../components/ui/GlobalStyles';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { C, S, F, R } from '../design/tokens';

export default function HandoffPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sendMode = searchParams.get('send') === 'true';
  const receiveMode = searchParams.get('receive') === 'true' || !sendMode;
  
  const [sendData, setSendData] = useState(null);
  const [receiveData, setReceiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (sendMode) {
      setLoading(true);
      // Mocking QR generation
      setTimeout(() => {
        setSendData({
          context_summary: "Debugging FastAPI authentication middleware and reviewing Stripe API logs for the Q3 strategy doc.",
          memories_count: 14,
          qr_base64: "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=handoff-example-id-123",
          expires_at: new Date(Date.now() + 300000).toISOString()
        });
        setLoading(false);
      }, 1000);
    }
  }, [sendMode]);

  useEffect(() => {
    if (sendData?.expires_at) {
      const end = new Date(sendData.expires_at).getTime();
      const tick = setInterval(() => {
        const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
        setCountdown(left);
        if (left === 0) clearInterval(tick);
      }, 1000);
      return () => clearInterval(tick);
    }
  }, [sendData]);

  const handleReceive = () => {
    setLoading(true);
    setTimeout(() => {
      setReceiveData({
        memories_imported: 14,
        graph_edges_built: 42,
        from_member: "Sarah",
        suggested_first_action: "Review the 'auth_backend' module documentation."
      });
      setLoading(false);
    }, 1500);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2,'0')}`;
  };

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <GlobalStyles />

      <Sidebar 
        items={NAV_ITEMS} 
        active="handoff" 
        onSelect={(id) => { if (id !== 'div') navigate(`/${id}`) }} 
        logo={logo} 
        accent={C.amber} 
      />

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar 
          title={sendMode ? "Share Context" : "Receive Handoff"} 
          subtitle={sendMode ? "Generate a cognitive snapshot for transfer" : "Import a team member's working context"}
          accent={C.amber} 
        />

        <main style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease', flex: 1, display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', alignItems: 'flex-start' }}>
          
          {sendMode && (
            <Card style={{ maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: F.lg, fontWeight: F.bold, color: C.textPrimary }}>Handoff Generator</h3>
                {countdown !== null && <Badge color={C.amber}>Expires in {fmt(countdown)}</Badge>}
              </div>

              {loading ? (
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: C.textSecondary, fontSize: F.sm }}>
                  Initializing neural snapshot...
                </div>
              ) : sendData ? (
                <>
                  <div style={{ background: C.bgActive, padding: '16px', borderRadius: R.md, border: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontSize: F.xs, fontWeight: F.bold, color: C.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Active Context</div>
                    <div style={{ fontSize: F.sm, color: C.textPrimary, lineHeight: 1.5 }}>{sendData.context_summary}</div>
                    <div style={{ fontSize: F.xs, color: C.amber, marginTop: '8px', fontWeight: F.semibold }}>{sendData.memories_count} semantic nodes captured</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '16px', background: '#fff', borderRadius: R.lg, display: 'inline-block', margin: '0 auto' }}>
                    <img src={sendData.qr_base64} alt="QR" style={{ width: '200px', height: '200px' }} />
                  </div>

                  <p style={{ fontSize: F.xs, color: C.textSecondary, textAlign: 'center', lineHeight: 1.6 }}>
                    Scanning this code will transfer your short-term cognitive state, active documents, and focus history to the receiver.
                  </p>
                </>
              ) : null}
            </Card>
          )}

          {receiveMode && !sendMode && (
            <Card style={{ maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', border: receiveData ? `1px solid ${C.teal}` : `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: F.lg, fontWeight: F.bold, color: receiveData ? C.teal : C.textPrimary }}>Cognitive Import</h3>

              {loading ? (
                <div style={{ height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: C.textSecondary, fontSize: F.sm }}>
                  Synchronizing memory clusters...
                </div>
              ) : receiveData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'slideUp 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: C.tealDim, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>✅</div>
                    <div>
                      <div style={{ fontSize: F.md, fontWeight: F.bold, color: C.textPrimary }}>Import Successful</div>
                      <div style={{ fontSize: F.xs, color: C.textSecondary }}>Source: {receiveData.from_member}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: C.bgActive, padding: '12px', borderRadius: R.md, textAlign: 'center' }}>
                      <div style={{ fontSize: F.xl, fontWeight: F.bold, color: C.teal }}>{receiveData.memories_imported}</div>
                      <div style={{ fontSize: F.xs, color: C.textMuted }}>Memories</div>
                    </div>
                    <div style={{ background: C.bgActive, padding: '12px', borderRadius: R.md, textAlign: 'center' }}>
                      <div style={{ fontSize: F.xl, fontWeight: F.bold, color: C.teal }}>{receiveData.graph_edges_built}</div>
                      <div style={{ fontSize: F.xs, color: C.textMuted }}>Connections</div>
                    </div>
                  </div>

                  <div style={{ background: `${C.teal}08`, borderLeft: `3px solid ${C.teal}`, padding: '16px', borderRadius: R.sm }}>
                    <div style={{ fontSize: F.xs, fontWeight: F.bold, color: C.teal, textTransform: 'uppercase', marginBottom: '4px' }}>Recommendation</div>
                    <div style={{ fontSize: F.sm, color: C.textPrimary }}>{receiveData.suggested_first_action}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button fullWidth onClick={() => navigate('/home')}>Accept State</Button>
                    <Button variant="secondary" onClick={() => navigate('/timeline')}>Preview</Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '24px' }}>
                  <div style={{ fontSize: '48px', opacity: 0.3 }}>📥</div>
                  <p style={{ textAlign: 'center', color: C.textSecondary, fontSize: F.sm, lineHeight: 1.6 }}>
                    No active handoff detected. <br/>
                    Scan a QR or paste a handoff ID below.
                  </p>
                  <Button variant="secondary" onClick={handleReceive}>Simulate Import Scan</Button>
                </div>
              )}
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
