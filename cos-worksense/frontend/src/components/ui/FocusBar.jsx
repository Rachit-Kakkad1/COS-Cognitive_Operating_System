export const FocusBar = ({ score, size = 'md' }) => {
  const filled = Math.round(score / 20)
  const color  = score >= 75 ? '#22c55e' :
                 score >= 50 ? '#eab308' : '#ef4444'
  const dim    = size === 'sm' ? '8px' : '10px'

  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width:        dim,
          height:       dim,
          borderRadius: '3px',
          background:   i <= filled ? color : '#1e1e36',
          transition:   'background 0.3s',
          boxShadow:    i <= filled ? `0 0 6px ${color}60` : 'none'
        }}/>
      ))}
    </div>
  )
}