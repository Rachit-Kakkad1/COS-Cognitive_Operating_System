export const Badge = ({ children, color = '#6366f1', dot }) => (
  <span style={{
    background:   `${color}18`,
    border:       `1px solid ${color}40`,
    color,
    borderRadius: '20px',
    padding:      '3px 10px',
    fontSize:     '11px',
    fontWeight:   600,
    display:      'inline-flex',
    alignItems:   'center',
    gap:          '5px',
    whiteSpace:   'nowrap',
    letterSpacing: '0.02em',
  }}>
    {dot && <span style={{
      width: '5px', height: '5px',
      borderRadius: '50%', background: color,
      animation: 'pulse 2s infinite'
    }}/>}
    {children}
  </span>
)