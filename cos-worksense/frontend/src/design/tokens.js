export const tokens = {
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
    glow: (color) => `0 0 20px ${color}30, 0 0 40px ${color}15`,
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
