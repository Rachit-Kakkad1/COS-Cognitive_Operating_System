export const Button = ({
  children, onClick, variant = 'primary',
  size = 'md', disabled, icon, fullWidth, style = {}
}) => {
  const variants = {
    primary: {
      background: '#6366f1',
      color:      '#fff',
      border:     '1px solid #6366f1',
    },
    secondary: {
      background: '#0e0e1a',
      color:      '#8888aa',
      border:     '1px solid #1e1e36',
    },
    ghost: {
      background: 'transparent',
      color:      '#8888aa',
      border:     '1px solid transparent',
    },
    danger: {
      background: '#ef444420',
      color:      '#ef4444',
      border:     '1px solid #ef444440',
    },
    success: {
      background: '#22c55e20',
      color:      '#22c55e',
      border:     '1px solid #22c55e40',
    },
  }
  const sizes = {
    sm: { padding: '6px 12px',  fontSize: '12px', borderRadius: '7px'  },
    md: { padding: '9px 16px',  fontSize: '13px', borderRadius: '9px'  },
    lg: { padding: '12px 22px', fontSize: '14px', borderRadius: '10px' },
  }
  const v = variants[variant] || variants.primary
  const sz = sizes[size] || sizes.md

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v, ...sz,
        fontWeight:    600,
        cursor:        disabled ? 'not-allowed' : 'pointer',
        opacity:       disabled ? 0.4 : 1,
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '6px',
        width:         fullWidth ? '100%' : 'auto',
        justifyContent: fullWidth ? 'center' : 'flex-start',
        transition:    'all 0.15s ease',
        whiteSpace:    'nowrap',
        fontFamily:    '-apple-system, Inter, sans-serif',
        ...style
      }}
      onMouseEnter={e => {
        if (disabled) return
        e.currentTarget.style.opacity   = '0.85'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity   = '1'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}