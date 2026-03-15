// RoleGuard.jsx
// Wraps any page or component.
// If role cannot access → shows friendly blocked screen.
// Never crashes · Never blank · Always graceful.

import { useNavigate } from 'react-router-dom'
import { useRoleAccess } from '../hooks/useRoleAccess'
import { useMode } from '../context/ModeContext'
import { useTheme } from '../context/ThemeContext'

const ROLE_EMOJIS = {
  professional: '👨‍💻',
  student: '🎓',
  child: '🧒',
  senior: '👴',
  parent: '👨‍👩‍👧',
  employee: '👔',
  manager: '🏢'
}

const RoleGuard = ({ feature, features, children }) => {
  const { canAccess, getBlockedMessage, getHomeRoute, role } = useRoleAccess()
  const { currentMode } = useMode()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const allowed = feature ? canAccess(feature) : (features && features.some(f => canAccess(f)))
  if (allowed) return children

  const checkFeature = feature || (features && features[0])
  const message = getBlockedMessage(checkFeature || 'default')
  const homeRoute = getHomeRoute()
  const emoji = ROLE_EMOJIS[role] || '🧠'
  const colors = currentMode?.colors || {
    bg: theme?.bg ?? '#0f0f0f',
    surface: theme?.bgCard ?? '#1a1a1a',
    border: theme?.border ?? '#2a2a2a',
    text: theme?.text ?? '#ffffff',
    textMuted: theme?.textMuted ?? '#a1a1aa',
    primary: '#6366f1'
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.bg,
      padding: '40px'
    }}>
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '20px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center'
      }}>

        <div style={{ fontSize: '64px', marginBottom: '24px' }}>
          {emoji}
        </div>

        <div style={{
          display: 'inline-block',
          background: `${colors.primary}22`,
          border: `1px solid ${colors.primary}`,
          borderRadius: '20px',
          padding: '4px 16px',
          fontSize: '12px',
          color: colors.primary,
          fontWeight: 500,
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          {role || 'guest'} mode
        </div>

        <h2 style={{
          color: colors.text,
          fontSize: role === 'senior' ? '24px' : '22px',
          fontWeight: 600,
          marginBottom: '12px',
          lineHeight: 1.3
        }}>
          This isn't for you
        </h2>

        <p style={{
          color: colors.textMuted,
          fontSize: role === 'senior' ? '17px' : '15px',
          lineHeight: 1.6,
          marginBottom: '32px'
        }}>
          {message}
        </p>

        <div style={{
          height: '1px',
          background: colors.border,
          marginBottom: '24px'
        }} />

        <p style={{
          color: colors.textMuted,
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          Here's what's available in your mode:
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            onClick={() => navigate(homeRoute)}
            style={{
              padding: '14px',
              background: colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {emoji} Go to my home
          </button>

          <button
            onClick={() => navigate('/mode-select')}
            style={{
              padding: '14px',
              background: 'transparent',
              color: colors.textMuted,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Switch mode
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleGuard
