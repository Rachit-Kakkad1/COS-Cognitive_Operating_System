export const Sidebar = ({ items, active, onSelect, logo, accent='#6366f1' }) => (
  <div style={{
    width:          '220px',
    minHeight:      '100vh',
    background:     '#080810',
    borderRight:    '1px solid #1e1e36',
    display:        'flex',
    flexDirection:  'column',
    padding:        '20px 12px',
    position:       'fixed',
    left:           0,
    top:            0,
    zIndex:         100,
    gap:            '2px',
  }}>
    <div style={{
      padding:      '8px 12px 20px',
      marginBottom: '8px',
      borderBottom: '1px solid #1e1e36',
    }}>
      {logo}
    </div>
    {items.map(item => (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            '10px',
          padding:        '9px 12px',
          borderRadius:   '9px',
          border:         'none',
          background:     active === item.id
            ? `${accent}18` : 'transparent',
          color:          active === item.id
            ? accent : '#8888aa',
          fontSize:       '13px',
          fontWeight:     active === item.id ? 600 : 400,
          cursor:         'pointer',
          transition:     'all 0.15s ease',
          textAlign:      'left',
          width:          '100%',
          borderLeft:     active === item.id
            ? `2px solid ${accent}` : '2px solid transparent',
        }}
        onMouseEnter={e => {
          if (active === item.id) return
          e.currentTarget.style.background = '#141428'
          e.currentTarget.style.color      = '#f0f0ff'
        }}
        onMouseLeave={e => {
          if (active === item.id) return
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color      = '#8888aa'
        }}
      >
        <span style={{ fontSize: '16px', opacity: 0.85 }}>
          {item.icon}
        </span>
        {item.label}
        {item.badge && (
          <span style={{
            marginLeft:   'auto',
            background:   `${accent}25`,
            color:        accent,
            borderRadius: '10px',
            padding:      '1px 7px',
            fontSize:     '10px',
            fontWeight:   700,
          }}>
            {item.badge}
          </span>
        )}
      </button>
    ))}
  </div>
)