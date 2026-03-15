export const StatusDot = ({ status }) => {
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
      boxShadow:    `0 0 6px ${color}`,
      flexShrink:   0,
    }}/>
  )
}