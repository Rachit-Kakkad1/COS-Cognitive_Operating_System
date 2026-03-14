import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import AskMemory from './pages/AskMemory'
import Timeline from './pages/Timeline'
import FocusMode from './pages/FocusMode'
import OverlayRecall from './components/OverlayRecall'

const NAV = [
  { to: '/', icon: '🧠', label: 'Home' },
  { to: '/ask', icon: '🎙️', label: 'Ask' },
  { to: '/timeline', icon: '📅', label: 'Timeline' },
  { to: '/focus', icon: '🎯', label: 'Focus' },
]

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 flex flex-col">
      {/* Main content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pb-24 pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ask" element={<AskMemory />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/focus" element={<FocusMode />} />
        </Routes>
      </main>

      {/* Overlay */}
      <OverlayRecall />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111118]/90 backdrop-blur-lg border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto flex justify-around py-3">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs transition-colors ${
                  isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              <span className="text-xl">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
