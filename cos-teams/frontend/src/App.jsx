import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import TeamSetup from './pages/TeamSetup'
import Home from './pages/Home'
import TeamDashboard from './pages/TeamDashboard'
import CoFounderView from './pages/CoFounderView'
import HandoffPage from './pages/HandoffPage'
import WeeklyReport from './pages/WeeklyReport'
import Timeline from './pages/Timeline'
import FocusReport from './pages/FocusReport'
import TeamBanner from './components/TeamBanner'
import TabGuardian from './components/TabGuardian'

const NAV = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/team', label: 'Team', icon: '👥' },
  { to: '/handoff', label: 'Handoff', icon: '🤝' },
  { to: '/report', label: 'Report', icon: '📊' },
  { to: '/timeline', label: 'Timeline', icon: '📅' },
]

export default function App() {
  const location = useLocation()
  const token = localStorage.getItem('cos_teams_founder_token') || localStorage.getItem('cos_teams_member_token')
  const isSetup = location.pathname === '/' || location.pathname === '/setup'

  if (!token && !isSetup && location.pathname !== '/setup') {
    return <Navigate to="/" replace />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
      {token && <TeamBanner />}
      <main style={{ paddingBottom: 80 }}>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/home" replace /> : <TeamSetup />} />
          <Route path="/setup" element={<TeamSetup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/team" element={<TeamDashboard />} />
          <Route path="/cofounder/:id" element={<CoFounderView />} />
          <Route path="/handoff" element={<HandoffPage />} />
          <Route path="/report" element={<WeeklyReport />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/focus" element={<FocusReport />} />
        </Routes>
      </main>
      <TabGuardian />
      {token && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,15,15,0.95)', borderTop: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-around', padding: '10px 0 12px', zIndex: 100 }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none', color: '#a1a1aa', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {({ isActive }) => (
                <>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ color: isActive ? '#f59e0b' : '#a1a1aa', fontWeight: isActive ? 600 : 400 }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
