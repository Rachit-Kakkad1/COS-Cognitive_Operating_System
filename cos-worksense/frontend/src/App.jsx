import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import OrgSetup from './pages/OrgSetup'
import ManagerDashboard from './pages/ManagerDashboard'
import EmployeeHome from './pages/EmployeeHome'
import FocusIntelligence from './pages/FocusIntelligence'
import ProductivityMatrix from './pages/ProductivityMatrix'
import SystemHealth from './pages/SystemHealth'
import Timeline from './pages/Timeline'
import Goals from './pages/Goals'
import WorkSenseBanner from './components/WorkSenseBanner'
import TabGuardian from './components/TabGuardian'

const MANAGER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏢' },
  { to: '/matrix', label: 'Matrix', icon: '📊' },
  { to: '/focus', label: 'Focus', icon: '🧠' },
  { to: '/system', label: 'System', icon: '⚡' },
  { to: '/timeline', label: 'Timeline', icon: '📅' },
]

const EMPLOYEE_NAV = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/focus', label: 'Focus', icon: '🧠' },
  { to: '/system', label: 'System', icon: '⚡' },
  { to: '/timeline', label: 'Timeline', icon: '📅' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
]

export default function App() {
  const location = useLocation()
  const managerToken = localStorage.getItem('ws_manager_token')
  const empToken = localStorage.getItem('ws_emp_token')
  const token = managerToken || empToken
  const isManager = !!managerToken
  const isSetup = location.pathname === '/' || location.pathname === '/setup'

  const smartRedirect = () => {
    if (managerToken) return <Navigate to="/dashboard" replace />
    if (empToken) return <Navigate to="/home" replace />
    return <Navigate to="/setup" replace />
  }

  if (!token && !isSetup && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
      {token && <WorkSenseBanner />}
      <main style={{ paddingBottom: 80 }}>
        <Routes>
          <Route path="/" element={token ? smartRedirect() : <Navigate to="/setup" replace />} />
          <Route path="/setup" element={<OrgSetup />} />
          <Route path="/dashboard" element={managerToken ? <ManagerDashboard /> : <Navigate to="/setup" replace />} />
          <Route path="/home" element={empToken ? <EmployeeHome /> : (managerToken ? <Navigate to="/dashboard" replace /> : <Navigate to="/setup" replace />)} />
          <Route path="/focus" element={<FocusIntelligence />} />
          <Route path="/matrix" element={managerToken ? <ProductivityMatrix /> : <Navigate to="/setup" replace />} />
          <Route path="/system" element={<SystemHealth />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/goals" element={empToken ? <Goals /> : (managerToken ? <Navigate to="/dashboard" replace /> : <Navigate to="/setup" replace />)} />
        </Routes>
      </main>
      <TabGuardian />
      {token && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,15,15,0.95)', borderTop: '1px solid #1f2937', display: 'flex', justifyContent: 'space-around', padding: '10px 0 12px', zIndex: 100 }}>
          {(isManager ? MANAGER_NAV : EMPLOYEE_NAV).map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none', color: '#9ca3af', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {({ isActive }) => (
                <>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ color: isActive ? '#14b8a6' : '#9ca3af', fontWeight: isActive ? 600 : 400 }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
