const fs = require('fs');
const path = require('path');

const b2b_token_code = `export const tokens = {
  // ── Colors ──────────────────────────────────────────────
  colors: {
    // Backgrounds
    bg:          '#080810',   // deepest background
    bgElevated:  '#0e0e1a',   // cards, panels
    bgHover:     '#141428',   // hover state
    bgActive:    '#1a1a32',   // active/selected

    // Borders
    border:      '#1e1e36',   // default border
    borderLight: '#2a2a4a',   // visible dividers
    borderFocus: '#6366f1',   // focused input border

    // Brand
    purple:      '#6366f1',   // primary COS color
    purpleDim:   '#6366f120', // 12% opacity backgrounds
    purpleGlow:  '#6366f140', // hover glow

    teal:        '#14b8a6',   // teams accent
    tealDim:     '#14b8a620',
    amber:       '#f59e0b',   // most popular / warning
    amberDim:    '#f59e0b20',

    // Status
    success:     '#22c55e',
    successDim:  '#22c55e20',
    danger:      '#ef4444',
    dangerDim:   '#ef444420',
    warning:     '#eab308',
    warningDim:  '#eab30820',

    // Text
    textPrimary:  '#f0f0ff',
    textSecondary:'#8888aa',
    textMuted:    '#55556a',
    textDisabled: '#3a3a50',
  },

  // ── Typography ───────────────────────────────────────────
  font: {
    family: '-apple-system, "SF Pro Display", "Inter", sans-serif',
    mono:   '"SF Mono", "Fira Code", "Cascadia Code", monospace',

    // Sizes
    xs:   '11px',
    sm:   '12px',
    base: '13px',
    md:   '14px',
    lg:   '16px',
    xl:   '18px',
    '2xl':'22px',
    '3xl':'28px',
    '4xl':'36px',

    // Weights
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
    black:    800,
  },

  // ── Spacing ──────────────────────────────────────────────
  space: {
    1: '4px',  2: '8px',  3: '12px', 4: '16px',
    5: '20px', 6: '24px', 7: '32px', 8: '40px',
    9: '48px', 10:'64px',
  },

  // ── Radii ────────────────────────────────────────────────
  radius: {
    sm:   '6px',
    md:   '10px',
    lg:   '14px',
    xl:   '18px',
    full: '9999px',
  },

  // ── Shadows ──────────────────────────────────────────────
  shadow: {
    sm:   '0 1px 3px rgba(0,0,0,0.4)',
    md:   '0 4px 16px rgba(0,0,0,0.5)',
    lg:   '0 8px 32px rgba(0,0,0,0.6)',
    glow: (color) => \`0 0 20px \${color}30, 0 0 40px \${color}15\`,
  },

  // ── Transitions ──────────────────────────────────────────
  transition: {
    fast:   'all 0.12s ease',
    normal: 'all 0.2s ease',
    slow:   'all 0.35s ease',
  },
}

export const C = tokens.colors
export const F = tokens.font
export const S = tokens.space
export const R = tokens.radius
`;

const components = {
  'Card.jsx': `export const Card = ({
  children, onClick, glow, accent,
  padding = '20px', radius = '14px', style = {}
}) => (
  <div onClick={onClick} style={{
    background:   '#0e0e1a',
    border:       \`1px solid \${glow ? accent || '#6366f1' : '#1e1e36'}\`,
    borderRadius: radius,
    padding,
    cursor:       onClick ? 'pointer' : 'default',
    transition:   'all 0.18s ease',
    boxShadow:    glow
      ? \`0 0 24px \${(accent||'#6366f1')}25\`
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
)`,

  'Button.jsx': `export const Button = ({
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
}`,

  'Badge.jsx': `export const Badge = ({ children, color = '#6366f1', dot }) => (
  <span style={{
    background:   \`\${color}18\`,
    border:       \`1px solid \${color}40\`,
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
)`,

  'StatCard.jsx': `export const StatCard = ({
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
)`,

  'FocusBar.jsx': `export const FocusBar = ({ score, size = 'md' }) => {
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
          boxShadow:    i <= filled ? \`0 0 6px \${color}60\` : 'none'
        }}/>
      ))}
    </div>
  )
}`,

  'StatusDot.jsx': `export const StatusDot = ({ status }) => {
  const colors = {
    deep_focus:  '#22c55e',
    focused:     '#22c55e',
    distracted:  '#eab308',
    off_task:    '#ef4444',
    idle:        '#ef4444',
    online:      '#22c55e',
    offline:     '#ef4444',
  }
  const color = colors[status] || '#55556a'
  return (
    <span style={{
      display:      'inline-block',
      width:        '7px',
      height:       '7px',
      borderRadius: '50%',
      background:   color,
      boxShadow:    \`0 0 6px \${color}\`,
      flexShrink:   0,
    }}/>
  )
}`,

  'Sidebar.jsx': `export const Sidebar = ({ items, active, onSelect, logo, accent='#6366f1' }) => (
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
            ? \`\${accent}18\` : 'transparent',
          color:          active === item.id
            ? accent : '#8888aa',
          fontSize:       '13px',
          fontWeight:     active === item.id ? 600 : 400,
          cursor:         'pointer',
          transition:     'all 0.15s ease',
          textAlign:      'left',
          width:          '100%',
          borderLeft:     active === item.id
            ? \`2px solid \${accent}\` : '2px solid transparent',
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
            background:   \`\${accent}25\`,
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
)`,

  'TopBar.jsx': `export const TopBar = ({
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
)`,

  'Table.jsx': `export const Table = ({ columns, rows, onRowClick, accent = '#6366f1' }) => (
  <div style={{
    background:   '#0e0e1a',
    border:       '1px solid #1e1e36',
    borderRadius: '14px',
    overflow:     'hidden',
  }}>
    <div style={{
      display:         'grid',
      gridTemplateColumns: columns.map(c => c.width || '1fr').join(' '),
      padding:         '12px 20px',
      background:      '#080810',
      borderBottom:    '1px solid #1e1e36',
    }}>
      {columns.map(col => (
        <div key={col.key} style={{
          fontSize:      '11px',
          color:         '#55556a',
          fontWeight:    600,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>
          {col.label}
        </div>
      ))}
    </div>
    {rows.map((row, i) => (
      <div
        key={i}
        onClick={() => onRowClick?.(row)}
        style={{
          display:         'grid',
          gridTemplateColumns: columns.map(c => c.width || '1fr').join(' '),
          padding:         '14px 20px',
          borderBottom:    i < rows.length - 1
            ? '1px solid #1e1e36' : 'none',
          cursor:          onRowClick ? 'pointer' : 'default',
          transition:      'background 0.12s ease',
          background:      row._accent
            ? \`\${row._accent}08\` : 'transparent',
          alignItems:      'center',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#141428'}
        onMouseLeave={e => e.currentTarget.style.background = row._accent ? \`\${row._accent}08\` : 'transparent'}
      >
        {columns.map(col => (
          <div key={col.key}>
            {col.render
              ? col.render(row[col.key], row)
              : (
                <span style={{ fontSize: '13px', color: '#f0f0ff' }}>
                  {row[col.key]}
                </span>
              )
            }
          </div>
        ))}
      </div>
    ))}
  </div>
)`,

  'Input.jsx': `export const Input = ({
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
)`,

  'GlobalStyles.jsx': `export const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: \`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #080810;
      color: #f0f0ff;
      font-family: -apple-system, 'SF Pro Display',
                   'Inter', sans-serif;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track  { background: #080810; }
    ::-webkit-scrollbar-thumb  { background: #1e1e36;
                                  border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #2a2a4a; }
    input, button { font-family: inherit; }
    @keyframes pulse {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.4; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  \`}} />
)`
};

const bases = [
  'C:\\\\Users\\\\CHITT\\\\OneDrive\\\\Desktop\\\\cos\\\\build-with-ai-hackcrux-2026\\\\cos-desktop-ui',
  'C:\\\\Users\\\\CHITT\\\\OneDrive\\\\Desktop\\\\cos\\\\build-with-ai-hackcrux-2026\\\\cos-teams\\\\frontend',
  'C:\\\\Users\\\\CHITT\\\\OneDrive\\\\Desktop\\\\cos\\\\build-with-ai-hackcrux-2026\\\\cos-worksense\\\\frontend'
];

bases.forEach(base => {
  const designDir = path.join(base, 'src', 'design');
  const uiDir = path.join(base, 'src', 'components', 'ui');
  
  if (!fs.existsSync(designDir)) fs.mkdirSync(designDir, { recursive: true });
  if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

  fs.writeFileSync(path.join(designDir, 'tokens.js'), b2b_token_code, 'utf8');

  for (const [filename, code] of Object.entries(components)) {
    fs.writeFileSync(path.join(uiDir, filename), code, 'utf8');
  }
});

console.log('Design system successfully injected into all 3 products.');
