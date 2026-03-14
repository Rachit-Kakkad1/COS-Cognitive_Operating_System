// Professional SVG Icons for COS
// Brand palette: #3EDBF0 (cyan), #77ACF1 (blue), #F0EBCC (cream), #04009A (navy)

/* ═══════════════════════════════════════════════════════════
   BRAIN LOGO — Premium geometric neural network
   A hexagonal neural mesh with signal-pulse animation
═══════════════════════════════════════════════════════════ */
export function BrainLogo({ size = 64, animated = true }) {
  // Unique IDs per render-context to avoid gradient conflicts across multiple instances
  const id = size + (animated ? 'a' : 's')

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        {/* Radial backdrop glow */}
        <radialGradient id={`bg-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#3EDBF0" stopOpacity="0.12" />
          <stop offset="70%"  stopColor="#04009A" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#020015" stopOpacity="0" />
        </radialGradient>

        {/* Primary stroke gradient — cyan → blue */}
        <linearGradient id={`g1-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#3EDBF0" />
          <stop offset="100%" stopColor="#77ACF1" />
        </linearGradient>

        {/* Secondary stroke gradient — blue → navy */}
        <linearGradient id={`g2-${id}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#77ACF1" />
          <stop offset="100%" stopColor="#04009A" />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Soft node glow */}
        <filter id={`nodeglow-${id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
        </filter>
      </defs>

      {/* ── Backdrop glow disc ── */}
      <circle cx="50" cy="50" r="46" fill={`url(#bg-${id})`} />

      {/* ── Outer hex ring (6-point) ── */}
      <polygon
        points="50,10 83,28 83,72 50,90 17,72 17,28"
        fill="none"
        stroke={`url(#g1-${id})`}
        strokeWidth="0.8"
        opacity="0.25"
      />

      {/* ── Inner hex ring ── */}
      <polygon
        points="50,22 72,34 72,66 50,78 28,66 28,34"
        fill="none"
        stroke={`url(#g1-${id})`}
        strokeWidth="0.6"
        opacity="0.15"
      />

      {/* ══ NEURAL NETWORK EDGES ══ */}
      {/* These are the connection lines between nodes */}
      {/* Hub → top-left, top-right */}
      <line x1="50" y1="50" x2="28" y2="34" stroke="#77ACF1" strokeWidth="0.7" opacity="0.4" />
      <line x1="50" y1="50" x2="72" y2="34" stroke="#77ACF1" strokeWidth="0.7" opacity="0.4" />
      {/* Hub → left, right */}
      <line x1="50" y1="50" x2="17" y2="50" stroke="#3EDBF0" strokeWidth="0.7" opacity="0.35" />
      <line x1="50" y1="50" x2="83" y2="50" stroke="#3EDBF0" strokeWidth="0.7" opacity="0.35" />
      {/* Hub → bottom-left, bottom-right */}
      <line x1="50" y1="50" x2="28" y2="66" stroke="#77ACF1" strokeWidth="0.7" opacity="0.4" />
      <line x1="50" y1="50" x2="72" y2="66" stroke="#77ACF1" strokeWidth="0.7" opacity="0.4" />
      {/* Hub → top, bottom */}
      <line x1="50" y1="50" x2="50" y2="10" stroke="#3EDBF0" strokeWidth="0.7" opacity="0.3" />
      <line x1="50" y1="50" x2="50" y2="90" stroke="#3EDBF0" strokeWidth="0.7" opacity="0.3" />

      {/* Perimeter connections */}
      <line x1="50" y1="10" x2="83" y2="28" stroke="#77ACF1" strokeWidth="0.5" opacity="0.2" />
      <line x1="83" y1="28" x2="83" y2="72" stroke="#77ACF1" strokeWidth="0.5" opacity="0.2" />
      <line x1="83" y1="72" x2="50" y2="90" stroke="#77ACF1" strokeWidth="0.5" opacity="0.2" />
      <line x1="50" y1="90" x2="17" y2="72" stroke="#77ACF1" strokeWidth="0.5" opacity="0.2" />
      <line x1="17" y1="72" x2="17" y2="28" stroke="#77ACF1" strokeWidth="0.5" opacity="0.2" />
      <line x1="17" y1="28" x2="50" y2="10" stroke="#77ACF1" strokeWidth="0.5" opacity="0.2" />

      {/* Cross-connections (web) */}
      <line x1="28" y1="34" x2="72" y2="34" stroke="#3EDBF0" strokeWidth="0.5" opacity="0.15" />
      <line x1="28" y1="66" x2="72" y2="66" stroke="#3EDBF0" strokeWidth="0.5" opacity="0.15" />
      <line x1="17" y1="50" x2="28" y2="34" stroke="#3EDBF0" strokeWidth="0.5" opacity="0.15" />
      <line x1="83" y1="50" x2="72" y2="34" stroke="#3EDBF0" strokeWidth="0.5" opacity="0.15" />

      {/* ══ SIGNAL PULSES (animated dots traveling edges) ══ */}
      {animated && (
        <>
          {/* Pulse: hub → top-right */}
          <circle r="1.6" fill="#3EDBF0" filter={`url(#nodeglow-${id})`}>
            <animateMotion dur="2.2s" repeatCount="indefinite" begin="0s">
              <mpath href={`#p1-${id}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" dur="2.2s" repeatCount="indefinite" begin="0s" />
          </circle>
          <path id={`p1-${id}`} d="M50,50 L72,34" fill="none" />

          {/* Pulse: hub → bottom-left */}
          <circle r="1.6" fill="#77ACF1" filter={`url(#nodeglow-${id})`}>
            <animateMotion dur="2.6s" repeatCount="indefinite" begin="0.5s">
              <mpath href={`#p2-${id}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" dur="2.6s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <path id={`p2-${id}`} d="M50,50 L28,66" fill="none" />

          {/* Pulse: hub → right perimeter */}
          <circle r="1.4" fill="#3EDBF0" filter={`url(#nodeglow-${id})`}>
            <animateMotion dur="1.9s" repeatCount="indefinite" begin="1.1s">
              <mpath href={`#p3-${id}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" dur="1.9s" repeatCount="indefinite" begin="1.1s" />
          </circle>
          <path id={`p3-${id}`} d="M50,50 L83,50" fill="none" />

          {/* Pulse: top-left → top */}
          <circle r="1.2" fill="#F0EBCC" filter={`url(#nodeglow-${id})`}>
            <animateMotion dur="2.0s" repeatCount="indefinite" begin="1.6s">
              <mpath href={`#p4-${id}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;0.8;0.8;0" dur="2.0s" repeatCount="indefinite" begin="1.6s" />
          </circle>
          <path id={`p4-${id}`} d="M28,34 L50,10" fill="none" />

          {/* Pulse: perimeter clockwise */}
          <circle r="1.2" fill="#77ACF1" filter={`url(#nodeglow-${id})`}>
            <animateMotion dur="3.5s" repeatCount="indefinite" begin="0.8s">
              <mpath href={`#p5-${id}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;0.7;0.7;0" dur="3.5s" repeatCount="indefinite" begin="0.8s" />
          </circle>
          <path id={`p5-${id}`} d="M50,10 L83,28 L83,72 L50,90 L17,72 L17,28 Z" fill="none" />
        </>
      )}

      {/* ══ NODES ══ */}
      {/* Outer hex corners */}
      {[
        [50, 10, '#3EDBF0', '0s'],
        [83, 28, '#77ACF1', '0.3s'],
        [83, 72, '#3EDBF0', '0.6s'],
        [50, 90, '#77ACF1', '0.9s'],
        [17, 72, '#3EDBF0', '1.2s'],
        [17, 28, '#77ACF1', '1.5s'],
      ].map(([cx, cy, fill, begin], i) => (
        <g key={i}>
          {/* Glow halo */}
          <circle cx={cx} cy={cy} r="3.5" fill={fill} opacity="0.12" />
          {/* Main node */}
          <circle cx={cx} cy={cy} r="2.2" fill={fill} opacity="0.9">
            {animated && <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" begin={begin} />}
          </circle>
          {/* Inner bright core */}
          <circle cx={cx} cy={cy} r="1" fill="#F0EBCC" opacity="0.6" />
        </g>
      ))}

      {/* Inner hex corners */}
      {[
        [50, 22, '#3EDBF0', '0.2s'],
        [72, 34, '#77ACF1', '0.5s'],
        [72, 66, '#3EDBF0', '0.8s'],
        [50, 78, '#77ACF1', '1.1s'],
        [28, 66, '#3EDBF0', '1.4s'],
        [28, 34, '#77ACF1', '1.7s'],
      ].map(([cx, cy, fill, begin], i) => (
        <g key={`inner-${i}`}>
          <circle cx={cx} cy={cy} r="2.8" fill={fill} opacity="0.1" />
          <circle cx={cx} cy={cy} r="1.8" fill={fill} opacity="0.85">
            {animated && <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2.2 + i * 0.25}s`} repeatCount="indefinite" begin={begin} />}
          </circle>
          <circle cx={cx} cy={cy} r="0.7" fill="#F0EBCC" opacity="0.5" />
        </g>
      ))}

      {/* ── Central HUB ── */}
      {/* Outer glow ring */}
      <circle cx="50" cy="50" r="8" fill="none" stroke="#3EDBF0" strokeWidth="0.5" opacity="0.2" />
      {/* Mid ring */}
      <circle cx="50" cy="50" r="5.5" fill="#3EDBF0" opacity="0.08" />
      {/* Hub body */}
      <circle cx="50" cy="50" r="4" fill="url(#g1-a)" opacity={animated ? undefined : '0.95'}>
        {animated && (
          <>
            <animate attributeName="r"       values="3.8;4.4;3.8"   dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.85;1;0.85"    dur="2.5s" repeatCount="indefinite" />
          </>
        )}
      </circle>
      {/* Hub highlight */}
      <circle cx="48.5" cy="48.5" r="1.5" fill="white" opacity="0.35" />

      {/* Pulsing ring when animated */}
      {animated && (
        <circle cx="50" cy="50" fill="none" stroke="#3EDBF0" strokeWidth="1">
          <animate attributeName="r"       values="4;14;4"   dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}


/* ═══════════════════════════════════════════════════════════
   NAV ICONS — Refined, minimal, premium
═══════════════════════════════════════════════════════════ */

export function HomeIcon({ active = false, size = 22 }) {
  const c = active ? '#3EDBF0' : 'rgba(240,235,204,0.45)'
  const dim = active ? 'rgba(62,219,240,0.3)' : 'rgba(240,235,204,0.12)'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central hub */}
      <circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1" fill={c} />
      {/* 4 axons */}
      <line x1="12" y1="9" x2="12" y2="4"   stroke={c}   strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="15" x2="12" y2="20" stroke={dim} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9"  y1="12" x2="4"  y2="12" stroke={dim} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="12" x2="20" y2="12" stroke={c}   strokeWidth="1.5" strokeLinecap="round" />
      {/* Endpoint nodes */}
      <circle cx="12" cy="3.5" r="1.5" fill={c} />
      <circle cx="20.5" cy="12" r="1.5" fill={c} />
      <circle cx="12" cy="20.5" r="1.2" fill={dim} />
      <circle cx="3.5" cy="12" r="1.2" fill={dim} />
    </svg>
  )
}

export function MicIcon({ active = false, size = 22 }) {
  const c = active ? '#3EDBF0' : 'rgba(240,235,204,0.45)'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Capsule mic body */}
      <rect x="8.5" y="2" width="7" height="13" rx="3.5"
        fill={active ? 'rgba(62,219,240,0.08)' : 'none'} />
      {/* Sound arc */}
      <path d="M4.5 11a7.5 7.5 0 0 0 15 0" />
      {/* Stand */}
      <line x1="12" y1="18.5" x2="12" y2="22" />
      <line x1="8.5" y1="22" x2="15.5" y2="22" />
      {/* Active indicator dot */}
      {active && <circle cx="12" cy="8.5" r="1.5" fill="#3EDBF0" stroke="none" />}
    </svg>
  )
}

export function TimelineIcon({ active = false, size = 22 }) {
  const c  = active ? '#3EDBF0' : 'rgba(240,235,204,0.45)'
  const c2 = active ? '#77ACF1' : 'rgba(240,235,204,0.28)'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Vertical spine */}
      <line x1="6" y1="3" x2="6" y2="21" stroke={c2} strokeWidth="1.3" strokeLinecap="round" />
      {/* Row 1 */}
      <circle cx="6" cy="6"  r="2.2" fill={c} />
      <line x1="10" y1="6" x2="21" y2="6" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      {/* Row 2 */}
      <circle cx="6" cy="13" r="2.2" fill={c2} />
      <line x1="10" y1="13" x2="19" y2="13" stroke={c2} strokeWidth="1.6" strokeLinecap="round" />
      {/* Row 3 */}
      <circle cx="6" cy="20" r="2.2" fill={active ? 'rgba(62,219,240,0.4)' : 'rgba(240,235,204,0.15)'} />
      <line x1="10" y1="20" x2="16" y2="20"
        stroke={active ? 'rgba(62,219,240,0.4)' : 'rgba(240,235,204,0.15)'}
        strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function FocusIcon({ active = false, size = 22 }) {
  const c  = active ? '#3EDBF0' : 'rgba(240,235,204,0.45)'
  const c2 = active ? 'rgba(62,219,240,0.35)' : 'rgba(240,235,204,0.18)'
  const c3 = active ? 'rgba(62,219,240,0.15)' : 'rgba(240,235,204,0.09)'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer ring */}
      <circle cx="12" cy="12" r="10" stroke={c3} strokeWidth="1.4" />
      {/* Mid ring */}
      <circle cx="12" cy="12" r="6.5" stroke={c2} strokeWidth="1.4" />
      {/* Inner ring */}
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.6" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1.4" fill={c} />
      {/* 4 tick marks for precision */}
      <line x1="12" y1="2.5" x2="12" y2="4.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="19.5" x2="12" y2="21.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="2.5" y1="12" x2="4.5" y2="12" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="19.5" y1="12" x2="21.5" y2="12" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}


/* ═══════════════════════════════════════════════════════════
   UTILITY ICONS
═══════════════════════════════════════════════════════════ */

export function SearchIcon({ size = 18, color = 'rgba(240,235,204,0.4)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export function SendIcon({ size = 18, color = '#3EDBF0' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function BoltIcon({ size = 18, color = '#77ACF1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function ClockIcon({ size = 14, color = 'rgba(240,235,204,0.35)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function AppIcon({ size = 14, color = '#77ACF1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2"  y="3"  width="7" height="7" rx="1.5" />
      <rect x="15" y="3"  width="7" height="7" rx="1.5" />
      <rect x="2"  y="14" width="7" height="7" rx="1.5" />
      <rect x="15" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function WifiIcon({ size = 12, color = '#3EDBF0' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill={color} stroke="none" />
    </svg>
  )
}


/* ═══════════════════════════════════════════════════════════
   COS WORDMARK — Gradient SVG text logo
═══════════════════════════════════════════════════════════ */
export function COSWordmark({ height = 32 }) {
  return (
    <svg height={height} viewBox="0 0 90 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3EDBF0" />
          <stop offset="55%"  stopColor="#77ACF1" />
          <stop offset="100%" stopColor="#F0EBCC" />
        </linearGradient>
      </defs>
      <text x="0" y="31" fill="url(#wg)"
        fontSize="34" fontFamily="'Outfit', sans-serif"
        fontWeight="800" letterSpacing="-1">COS</text>
    </svg>
  )
}


/* ═══════════════════════════════════════════════════════════
   COS LOGOMARK — Brain icon + wordmark combined (for nav/header)
═══════════════════════════════════════════════════════════ */
export function COSLogo({ height = 36 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <BrainLogo size={height} animated={false} />
      <COSWordmark height={height} />
    </div>
  )
}
