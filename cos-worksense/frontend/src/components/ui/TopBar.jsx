export const TopBar = ({
  title, subtitle, actions, accent = '#6366f1'
}) => (
  <div style={{
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 32px',
    height:         '60px',
    borderBottom:   '1px solid #1e1e36',
    background:     '#080810',
    position:       'sticky',
    top:            0,
    zIndex:         50,
  }}>
    <div>
      <div style={{
        fontSize: '15px', fontWeight: 600, color: '#f0f0ff'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: '#55556a' }}>
          {subtitle}
        </div>
      )}
    </div>
    {actions && (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {actions}
      </div>
    )}
  </div>
)