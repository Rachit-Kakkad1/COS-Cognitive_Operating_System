import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AskMemory from './pages/AskMemory'
import Timeline from './pages/Timeline'
import FocusMode from './pages/FocusMode'
import WorkSense from './pages/WorkSense'
import CognitiveGraph from './components/CognitiveGraph'
import OverlayRecall from './components/OverlayRecall'
import TabGuardian from './components/TabGuardian'
import SystemGuardian from './components/SystemGuardian'
import StoragePaywall from './components/StoragePaywall'
import RoleGuard from './components/RoleGuard'
import RoleNavBar from './components/RoleNavBar'

import { useMode } from './context/ModeContext'
import ModeSelector from './pages/ModeSelector'

import ProfessionalHome from './pages/modes/ProfessionalHome'
import StudentHome from './pages/modes/StudentHome'
import ParentHome from './pages/modes/ParentHome'
import ChildHome from './pages/modes/ChildHome'
import SeniorHome from './pages/modes/SeniorHome'
import EmployeeHome from './pages/modes/EmployeeHome'

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

          {/* Mode-specific home — role-gated */}
          <Route path="/home" element={
            <RoleGuard feature="home">
              {mode === 'professional' ? <ProfessionalHome /> :
               mode === 'student'      ? <StudentHome />      :
               mode === 'parent'       ? <ParentHome />       :
               mode === 'child'        ? <ChildHome />        :
               mode === 'senior'       ? <SeniorHome />       :
               mode === 'employee'     ? <EmployeeHome />     :
               mode === 'manager'      ? <WorkSense />        :
               <Navigate to="/mode-select" replace />}
            </RoleGuard>
          }/>

          <Route path="/ask" element={<RoleGuard feature="recall"><AskMemory /></RoleGuard>} />
          <Route path="/timeline" element={<RoleGuard feature="timeline"><Timeline /></RoleGuard>} />
          <Route path="/focus" element={<RoleGuard features={['focus_report', 'focus_mode']}><FocusMode /></RoleGuard>} />
          <Route path="/graph" element={<RoleGuard feature="cognitive_graph"><CognitiveGraph /></RoleGuard>} />
          <Route path="/worksense" element={<RoleGuard feature="manager_dashboard"><WorkSense /></RoleGuard>} />
        </Routes>
      </main>

      {!isLandingOrAuth && <OverlayRecall mode={mode} colors={c} />}
      <TabGuardian mode={mode} colors={c} />
      <SystemGuardian />
      <StoragePaywall />

      {/* Role-aware bottom nav — only tabs this role can access */}
      {!isLandingOrAuth && <RoleNavBar />}
    </div>
  )
}
