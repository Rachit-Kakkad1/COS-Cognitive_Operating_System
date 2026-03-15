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
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f0f0ff', fontFamily: '-apple-system, Inter, sans-serif' }}>
      <main>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/home" replace /> : <TeamSetup />} />
          <Route path="/setup" element={<TeamSetup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/team" element={<TeamDashboard />} />
          <Route path="/dashboard" element={<TeamDashboard />} />
          <Route path="/cofounder/:id" element={<CoFounderView />} />
          <Route path="/handoff" element={<HandoffPage />} />
          <Route path="/report" element={<WeeklyReport />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/focus" element={<FocusReport />} />
        </Routes>
      </main>
      <TabGuardian />
    </div>
  )
}
