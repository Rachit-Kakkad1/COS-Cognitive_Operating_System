import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AskMemory from './pages/AskMemory'
import Timeline from './pages/Timeline'
import FocusReport from './pages/FocusReport'
import SystemHealth from './pages/SystemHealth'
import WorkSense from './pages/WorkSense'
import CognitiveGraph from './components/CognitiveGraph'
import OverlayRecall from './components/OverlayRecall'
import TabGuardian from './components/TabGuardian'
import SystemGuardian from './components/SystemGuardian'
import StoragePaywall from './components/StoragePaywall'
import RoleGuard from './components/RoleGuard'
import ModeSelector from './pages/ModeSelector'

import { useMode } from './context/ModeContext'

import ProfessionalHome from './pages/modes/ProfessionalHome'
import StudentHome from './pages/modes/StudentHome'
import ParentHome from './pages/modes/ParentHome'
import ChildHome from './pages/modes/ChildHome'
import SeniorHome from './pages/modes/SeniorHome'
import EmployeeHome from './pages/modes/EmployeeHome'

export default function App() {
  const location = useLocation()
  const { mode } = useMode()
  
  const isLandingOrAuth = location.pathname === '/' || location.pathname === '/auth'

  return (
    <>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/auth"     element={<Auth />} />
        <Route path="/mode-select" element={<ModeSelector />} />

        {/* Home Route — handles redirection if mode not set */}
        <Route path="/home" element={
          !mode ? <Navigate to="/mode-select" replace /> :
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
        <Route path="/focus" element={<RoleGuard features={['focus_report', 'focus_mode']}><FocusReport /></RoleGuard>} />
        <Route path="/system" element={<RoleGuard feature="system_health"><SystemHealth /></RoleGuard>} />
        <Route path="/graph" element={<RoleGuard feature="cognitive_graph"><CognitiveGraph /></RoleGuard>} />
        <Route path="/worksense" element={<RoleGuard feature="manager_dashboard"><WorkSense /></RoleGuard>} />
      </Routes>

      {!isLandingOrAuth && <OverlayRecall mode={mode} />}
      <TabGuardian mode={mode} />
      <SystemGuardian />
      <StoragePaywall />
    </>
  )
}
