import { useTheme } from '../context/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} style={{
      background: theme.bgCard,
      border:     `1px solid ${theme.border}`,
      borderRadius: '20px',
      padding:    '6px 14px',
      cursor:     'pointer',
      fontSize:   '13px',
      color:      theme.text,
      display:    'flex',
      alignItems: 'center',
      gap:        '6px',
      transition: '0.2s'
    }}>
      {theme.dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}

export default ThemeToggle
