import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainLogo } from '../components/Icons'

// Premium geometric Auth flow (Fake Google OAuth + Consent)
export default function Auth() {
  const navigate = useNavigate()
  
  // States: 'login' -> 'authenticating' -> 'consent' -> 'done'
  const [step, setStep] = useState('login')
  
  // Simulated authentication flow
  const handleGoogleAuth = () => {
    setStep('authenticating')
    // Simulate network delay for OAuth
    setTimeout(() => {
      setStep('consent')
    }, 1800)
  }

  const handleConsent = () => {
    setStep('done')
    // Simulate final setup before redirecting to Home app
    setTimeout(() => {
      navigate('/home')
    }, 1200)
  }

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', width: 800, height: 800,
        background: 'radial-gradient(circle,rgba(4,0,154,0.3) 0%,transparent 70%)',
        borderRadius: '50%', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        animation: 'glowPulse 6s ease-in-out infinite',
        zIndex: 0
      }} />

      {/* Main Auth Card */}
      <div className="glass" style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 440,
        padding: '48px 40px',
        textAlign: 'center',
        border: '1px solid rgba(62,219,240,0.15)',
        animation: 'slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        
        {/* Logo Hub */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 32px',
          background: 'linear-gradient(135deg,rgba(62,219,240,0.15),rgba(119,172,241,0.08))',
          border: '1px solid rgba(62,219,240,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 32px rgba(62,219,240,0.15)',
          animation: step === 'authenticating' ? 'pulse 1s infinite' : 'none'
        }}>
          <BrainLogo size={40} animated={true} />
        </div>

        {/* --- STEP 1: INITIAL LOGIN --- */}
        {step === 'login' && (
          <div style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>
              Connect to COS
            </h1>
            <p style={{ color: 'rgba(240,235,204,0.5)', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
              Sign in to secure your fully local cognitive operating system.
            </p>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleAuth}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(240,235,204,0.15)',
                borderRadius: 12, padding: '14px 24px',
                color: 'var(--cream)', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(240,235,204,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(240,235,204,0.15)';
              }}
            >
              {/* Fake Google G SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26498 14.2949L4.44425 17.362L1.43981 17.425C0.521873 15.7505 0 13.9213 0 12C0 10.3235 0.4542 8.65063 1.25884 7.10098H1.25997L3.92482 7.5878L5.05193 10.1691C4.81938 10.7497 4.69599 11.3664 4.69599 12C4.69599 12.8023 4.88761 13.5857 5.26498 14.2949Z" />
                <path fill="#FBBC05" d="M23.6496 9.85107C23.8783 10.5367 24 11.2584 24 12C24 12.8344 23.8398 13.6393 23.5412 14.3944L23.5406 14.3967L19.9845 13.7853L19.4678 10.6015C19.7423 11.0505 19.891 11.538 19.891 12.0401C19.891 12.8872 19.5636 13.7121 18.9649 14.3468L22.2598 17.2001C23.4735 15.8236 24 14.0041 24 12C24 11.238 23.8967 10.4998 23.6967 9.80004L23.6496 9.85107Z" />
                <path fill="#4285F4" d="M12 24C15.2443 24 18.1571 22.8465 20.3275 20.8402L17.1197 17.9171C15.6888 18.9189 13.9317 19.4975 12 19.4975C8.36986 19.4975 5.29176 17.1594 4.14811 13.8824L0.864746 16.4259C3.01353 20.6865 7.22855 24 12 24Z" />
                <path fill="#34A853" d="M12 4.698C13.8378 4.698 15.5398 5.31835 16.8912 6.36885L20.2188 3.04125C18.0191 1.0528 15.1764 0 12 0C7.3005 0 3.12078 3.23555 0.941406 7.40455L4.17518 9.9142C5.37895 6.69975 8.4116 4.698 12 4.698Z" />
              </svg>
              Continue with Google
            </button>
            <p style={{ marginTop: 24, fontSize: 12, color: 'rgba(240,235,204,0.3)' }}>
              Fully local. Authentication keys never leave your machine.
            </p>
          </div>
        )}

        {/* --- STEP 2: AUTHENTICATING --- */}
        {step === 'authenticating' && (
          <div style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Authenticating...</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '24px 0' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3EDBF0', animation: 'dotBlink 1.4s infinite' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3EDBF0', animation: 'dotBlink 1.4s infinite 0.2s' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3EDBF0', animation: 'dotBlink 1.4s infinite 0.4s' }} />
            </div>
            <p style={{ color: 'rgba(62,219,240,0.7)', fontSize: 13 }}>Exchanging OAuth tokens securely</p>
          </div>
        )}

        {/* --- STEP 3: CONSENT FORM --- */}
        {step === 'consent' && (
          <div style={{ animation: 'slideInRight 0.4s ease-out', textAlign: 'left' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Data Consent</h2>
            <p style={{ color: 'rgba(240,235,204,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
              COS needs access to your screen context to build semantic memory.
            </p>
            
            <div style={{ background: 'rgba(4,0,154,0.2)', border: '1px solid rgba(119,172,241,0.15)', borderRadius: 12, padding: '16px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>👁️</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Screen Context Capture</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,235,204,0.4)', marginTop: 4 }}>Capture active window content, Chrome DOM text, and titles locally every 30s.</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 20 }}>🧬</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Local Semantic Embedding</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,235,204,0.4)', marginTop: 4 }}>Process metadata using all-MiniLM-L6-v2. Data is never sent to the cloud.</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleConsent}
              className="btn-primary"
              style={{ width: '100%', fontSize: 15, padding: '14px 0' }}
            >
              I Agree, Launch Extension
            </button>
          </div>
        )}

        {/* --- STEP 4: DONE REDIRECTING --- */}
        {step === 'done' && (
          <div style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(62,219,240,0.15)', border: '2px solid #3EDBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
              ✓
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Authorized</h2>
            <p style={{ color: 'rgba(62,219,240,0.8)', fontSize: 14 }}>Initializing Cognitive System...</p>
          </div>
        )}

      </div>
    </div>
  )
}
