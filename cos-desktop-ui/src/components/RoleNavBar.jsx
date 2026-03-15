// RoleNavBar.jsx
import { NavLink } from 'react-router-dom'
import { useRoleAccess } from '../hooks/useRoleAccess'
import { useMode } from '../context/ModeContext'
import { HomeIcon, MicIcon, TimelineIcon, FocusIcon } from './Icons'

const ALL_NAV_ITEMS = [
  { feature: 'home', to: '/home', label: 'Home', Icon: HomeIcon },
  { feature: 'recall', to: '/ask', label: 'Ask', Icon: MicIcon },
  { feature: 'timeline', to: '/timeline', label: 'Timeline', Icon: TimelineIcon },
  { feature: 'cognitive_graph', to: '/graph', label: 'Graph', Icon: FocusIcon },
  { feature: 'focus_report', to: '/focus', label: 'Focus', Icon: FocusIcon },
  { feature: 'focus_mode', to: '/focus', label: 'Focus', Icon: FocusIcon },
  { feature: 'system_health', to: '/focus', label: 'System', Icon: FocusIcon },
  { feature: 'manager_dashboard', to: '/worksense', label: 'WorkSense', Icon: FocusIcon }
]

const RoleNavBar = () => {
  const { canAccess, role } = useRoleAccess()
  const { mode } = useMode()

  const visibleItems = ALL_NAV_ITEMS
    .filter(item => canAccess(item.feature))
    .filter((item, i, arr) => arr.findIndex(x => x.to === item.to) === i)
    .slice(0, 5)

  if (visibleItems.length === 0) return null

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d0d0f] border-r border-cos-border flex-shrink-0 z-20">
        <div className="p-6 flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white">🧠 COS</span>
          </div>
          <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-cos-primary/10 text-cos-primary uppercase border border-cos-primary/20">
            {role || 'Pro'}
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <div className="text-[11px] font-semibold text-cos-muted uppercase tracking-wider mb-3 px-2">Menu</div>
          {visibleItems.map(({ feature, to, label, Icon }) => (
            <NavLink key={feature} to={to} className="block">
              {({ isActive }) => (
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 border border-transparent ${isActive ? 'bg-cos-primary/10 text-white border-cos-primary/20' : 'text-cos-muted hover:text-white hover:bg-white/5'}`}>
                  <div className={`${isActive ? 'text-cos-primary' : 'text-cos-muted opacity-80'}`}>
                    <Icon active={isActive} size={18} />
                  </div>
                  <span className="font-medium text-[14px]">{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-cos-border">
          <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-inner text-white">
              {mode ? mode.substring(0,2).toUpperCase() : 'US'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white capitalize">{mode || 'User Session'}</span>
              <span className="text-xs text-cos-muted">Profile Settings</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0f]/95 backdrop-blur-xl border-t border-cos-border z-50 px-2 py-2 flex justify-around items-center pb-safe">
        {visibleItems.map(({ feature, to, label, Icon }) => (
          <NavLink key={feature} to={to} className="flex flex-col items-center gap-1 p-2 flex-1">
            {({ isActive }) => (
              <>
                <div className={`${isActive ? 'text-cos-primary' : 'text-cos-muted'} transition-all`}>
                  <Icon active={isActive} size={20} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-cos-muted'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default RoleNavBar
