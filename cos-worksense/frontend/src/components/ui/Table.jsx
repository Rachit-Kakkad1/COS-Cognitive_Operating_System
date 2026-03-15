export const Table = ({ columns, rows, onRowClick, accent = '#6366f1' }) => (
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
            ? `${row._accent}08` : 'transparent',
          alignItems:      'center',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#141428'}
        onMouseLeave={e => e.currentTarget.style.background = row._accent ? `${row._accent}08` : 'transparent'}
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
)