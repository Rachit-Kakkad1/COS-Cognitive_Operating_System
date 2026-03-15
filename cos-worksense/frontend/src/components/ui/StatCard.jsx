export const StatCard = ({
  label, value, sub, accent = '#6366f1', icon, trend
}) => (
  <div style={{
    background:   '#0e0e1a',
    border:       '1px solid #1e1e36',
    borderRadius: '12px',
    padding:      '18px 20px',
    transition:   'border-color 0.2s',
  }}
  onMouseEnter={e =>
    e.currentTarget.style.borderColor = accent}
  onMouseLeave={e =>
    e.currentTarget.style.borderColor = '#1e1e36'}
  >
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'flex-start',
      marginBottom:   '10px'
    }}>
      <span style={{
        fontSize: '12px', color: '#55556a',
        fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.06em'
      }}>
        {label}
      </span>
      {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
    </div>
    <div style={{
      fontSize: '28px', fontWeight: 800,
      color: '#f0f0ff', lineHeight: 1, marginBottom: '6px'
    }}>
      {value}
    </div>
    {(sub || trend) && (
      <div style={{
        fontSize: '12px',
        color: trend?.startsWith('+') ? '#22c55e' :
               trend?.startsWith('-') ? '#ef4444' : '#55556a'
      }}>
        {trend} {sub}
      </div>
    )}
  </div>
)