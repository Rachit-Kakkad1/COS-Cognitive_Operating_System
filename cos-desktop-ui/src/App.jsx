import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AskMemory from './pages/AskMemory'
import Timeline from './pages/Timeline'
import FocusMode from './pages/FocusMode'
import WorkSense from './pages/WorkSense'
import OverlayRecall from './components/OverlayRecall'
import TabGuardian from './components/TabGuardian'
import SystemGuardian from './components/SystemGuardian'
import StoragePaywall from './components/StoragePaywall'
import { HomeIcon, MicIcon, TimelineIcon, FocusIcon } from './components/Icons'

import { useMode } from './context/ModeContext'
import ModeSelector from './pages/ModeSelector'

// Mode-specific home pages
import ProfessionalHome from './pages/modes/ProfessionalHome'
import StudentHome      from './pages/modes/StudentHome'
import ParentHome       from './pages/modes/ParentHome'
import ChildHome        from './pages/modes/ChildHome'
import SeniorHome       from './pages/modes/SeniorHome'
import EmployeeHome     from './pages/modes/EmployeeHome'

const NAV = [
  { to: '/home',      Icon: HomeIcon,     label: 'Home' },
  { to: '/ask',       Icon: MicIcon,      label: 'Ask' },
  { to: '/timeline',  Icon: TimelineIcon, label: 'Timeline' },
  { to: '/focus',     Icon: FocusIcon,    label: 'Focus' },
  { to: '/worksense', Icon: FocusIcon,    label: 'WorkSense' },
]

export default function App() {
  const location = useLocation()
  const { mode, currentMode } = useMode()
  
  const isLandingOrAuth = location.pathname === '/' || location.pathname === '/auth'

  // Global mode selector block logic
  if (!isLandingOrAuth && !mode && location.pathname !== '/mode-select') {
    return <ModeSelector />
  }

  // Define active color palette or fallback
  const c = currentMode ? currentMode.colors : null

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: "'Outfit', sans-serif",
      background: c ? c.bg : undefined,
      color: c ? c.text : undefined,
      transition: 'all 0.3s ease',
      fontSize: currentMode?.features.largeText ? '18px' : '14px'
    }}>

      {/* Main content */}
      <main style={isLandingOrAuth ? {} : {
        flex: 1, maxWidth: 860, width: '100%', margin: '0 auto',
        padding: '0 20px 100px', paddingTop: 24,
      }}>
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/auth"     element={<Auth />} />
          
          <Route path="/mode-select" element={<ModeSelector />} />

          {/* Mode-specific home */}
          <Route path="/home" element={
            mode === 'professional' ? <ProfessionalHome /> :
            mode === 'student'      ? <StudentHome />      :
            mode === 'parent'       ? <ParentHome />       :
            mode === 'child'        ? <ChildHome />        :
            mode === 'senior'       ? <SeniorHome />       :
            mode === 'employee'     ? <EmployeeHome />     :
            <Navigate to="/mode-select" replace />
          }/>

          <Route path="/ask"      element={<AskMemory />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/focus"    element={<FocusMode />} />
          <Route path="/worksense" element={<WorkSense />} />
        </Routes>
      </main>

      {/* Overlay recall — only in app */}
      {!isLandingOrAuth && <OverlayRecall mode={mode} colors={c} />}
      <TabGuardian mode={mode} colors={c} />
      <SystemGuardian />
      <StoragePaywall />

      {/* Bottom Nav — only in app pages */}
      {!isLandingOrAuth && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(2,0,21,0.75)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderTop: '1px solid rgba(62,219,240,0.12)',
          zIndex: 100,
        }}>
          {/* Top glow line */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg,transparent,rgba(62,219,240,0.35),transparent)',
          }} />

          <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'space-around', padding: '10px 0 8px' }}>
            {NAV.map(({ to, Icon, label }) => (
              <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    position: 'relative', padding: '4px 16px',
                    transition: 'all 0.2s',
                  }}>
                    {isActive && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(62,219,240,0.07)',
                        border: '1px solid rgba(62,219,240,0.15)',
                        borderRadius: 12,
                        animation: 'scaleIn 0.2s ease-out',
                      }} />
                    )}
                    <div style={{
                      position: 'relative', zIndex: 1,
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(62,219,240,0.6))' : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
                    }}>
                      <Icon active={isActive} size={21} />
                      {isActive && (
                        <div style={{
                          position: 'absolute', inset: -4,
                          border: '1px solid rgba(62,219,240,0.4)',
                          borderRadius: '50%',
                          animation: 'orbitPing 2s ease-out infinite',
                        }} />
                      )}
                    </div>
                    <span style={{
                      position: 'relative', zIndex: 1,
                      fontSize: 10, fontWeight: isActive ? 600 : 400,
                      letterSpacing: '0.06em',
                      color: isActive ? '#3EDBF0' : 'rgba(240,235,204,0.38)',
                      textShadow: isActive ? '0 0 12px rgba(62,219,240,0.5)' : 'none',
                      transition: 'all 0.2s',
                    }}>{label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
