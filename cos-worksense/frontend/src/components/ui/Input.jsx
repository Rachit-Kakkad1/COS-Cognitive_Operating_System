export const Input = ({
  placeholder, value, onChange, icon,
  type = 'text', accent = '#6366f1'
}) => (
  <div style={{ position: 'relative' }}>
    {icon && (
      <span style={{
        position:  'absolute',
        left:      '12px',
        top:       '50%',
        transform: 'translateY(-50%)',
        fontSize:  '16px',
        opacity:   0.5,
        pointerEvents: 'none',
      }}>
        {icon}
      </span>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width:        '100%',
        padding:      icon ? '10px 14px 10px 38px' : '10px 14px',
        background:   '#0e0e1a',
        border:       '1px solid #1e1e36',
        borderRadius: '9px',
        color:        '#f0f0ff',
        fontSize:     '13px',
        outline:      'none',
        transition:   'border-color 0.15s',
        boxSizing:    'border-box',
        fontFamily:   '-apple-system, Inter, sans-serif',
      }}
      onFocus={e  => e.target.style.borderColor = accent}
      onBlur={e   => e.target.style.borderColor = '#1e1e36'}
    />
  </div>
)