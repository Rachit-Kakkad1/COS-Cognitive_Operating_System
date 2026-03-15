// RoleNavBar.jsx
// Bottom nav that shows ONLY the tabs available for the current role.
// Child sees: Home · Study · Rewards · Timer (up to 5)
// Senior sees: Home · Recall · Timeline · Memory (up to 5)
// Manager sees: Home · Dashboard · Timeline · System (up to 5)
// Never shows a tab the role cannot access.

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
  const { currentMode } = useMode()

  const colors = currentMode?.colors || {
    surface: '#1a1a1a',
    border: '#2a2a2a',
    primary: '#6366f1',
    textMuted: 'rgba(240,235,204,0.38)',
    text: '#ffffff'
  }

  const visibleItems = ALL_NAV_ITEMS
    .filter(item => canAccess(item.feature))
    .filter((item, i, arr) => arr.findIndex(x => x.to === item.to) === i)
    .slice(0, 5)

  if (visibleItems.length === 0) return null

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(2,0,21,0.75)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderTop: `1px solid ${colors.border}`,
      zIndex: 100
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        right: '10%',
        height: 1,
        background: `linear-gradient(90deg,transparent,${colors.primary}59,transparent)`
      }} />
      <div style={{
        maxWidth: 860,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0 8px'
      }}>
        {visibleItems.map(({ feature, to, label, Icon }) => (
          <NavLink key={feature} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                position: 'relative',
                padding: '4px 16px',
                transition: 'all 0.2s'
              }}>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `${colors.primary}12`,
                    border: `1px solid ${colors.primary}26`,
                    borderRadius: 12,
                    animation: 'scaleIn 0.2s ease-out'
                  }} />
                )}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  filter: isActive ? `drop-shadow(0 0 8px ${colors.primary}99)` : 'none',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)'
                }}>
                  <Icon active={isActive} size={21} />
                </div>
                <span style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.06em',
                  color: isActive ? colors.primary : colors.textMuted,
                  transition: 'all 0.2s'
                }}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default RoleNavBar
