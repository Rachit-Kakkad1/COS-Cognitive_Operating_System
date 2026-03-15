export const Card = ({
  children, onClick, glow, accent,
  padding = '20px', radius = '14px', style = {}
}) => (
  <div onClick={onClick} style={{
    background:   '#0e0e1a',
    border:       `1px solid ${glow ? accent || '#6366f1' : '#1e1e36'}`,
    borderRadius: radius,
    padding,
    cursor:       onClick ? 'pointer' : 'default',
    transition:   'all 0.18s ease',
    boxShadow:    glow
      ? `0 0 24px ${(accent||'#6366f1')}25`
      : '0 2px 8px rgba(0,0,0,0.3)',
    ...style
  }}
  onMouseEnter={e => {
    if (!onClick) return
    e.currentTarget.style.background    = '#141428'
    e.currentTarget.style.borderColor   = accent || '#6366f1'
    e.currentTarget.style.transform     = 'translateY(-1px)'
  }}
  onMouseLeave={e => {
    if (!onClick) return
    e.currentTarget.style.background    = '#0e0e1a'
    e.currentTarget.style.borderColor   = glow
      ? accent || '#6366f1' : '#1e1e36'
    e.currentTarget.style.transform     = 'translateY(0)'
  }}>
    {children}
  </div>
)