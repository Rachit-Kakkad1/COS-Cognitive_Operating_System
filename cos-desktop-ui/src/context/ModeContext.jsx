import { createContext, useContext, useState } from 'react'
import { useTheme } from './ThemeContext'

export const MODES = {
  professional: {
    id:          'professional',
    label:       'Professional',
    emoji:       '👨💻',
    description: 'For developers, founders, knowledge workers',
    tone:        'technical',
    colors: {
      dark: {
        primary:   '#6366f1',
        secondary: '#14b8a6',
        accent:    '#f59e0b',
        bg:        '#0f0f0f',
        surface:   '#1a1a1a',
        border:    '#2a2a2a',
        text:      '#ffffff',
        textMuted: '#a1a1aa',
      },
      light: {
        primary:   '#4f46e5',
        secondary: '#0d9488',
        accent:    '#d97706',
        bg:        '#f8fafc',
        surface:   '#ffffff',
        border:    '#e2e8f0',
        text:      '#0f172a',
        textMuted: '#64748b',
      }
    },
    features: {
      contextRecall:      true,
      voicePipeline:      true,
      cognitiveGraph:     true,
      tabGuardian:        true,
      timeline:           true,
      focusMode:          true,
      focusReport:        true,
      systemHealth:       true,
      productivityMatrix: false,
      childSafeMode:      false,
      studyTracker:       false,
      breakReminder:      true,
      burnoutWarning:     true,
      achievementBadges:  false,
      memoryAid:          false,
      screenTimeGuard:    false,
    }
  },

  student: {
    id:          'student',
    label:       'Student',
    emoji:       '🎓',
    description: 'For students of all ages',
    tone:        'friendly',
    colors: {
      dark: {
        primary:   '#8b5cf6',
        secondary: '#06b6d4',
        accent:    '#10b981',
        bg:        '#0d0d1a',
        surface:   '#13132a',
        border:    '#1e1e3a',
        text:      '#f0f0ff',
        textMuted: '#8888bb',
      },
      light: {
        primary:   '#7c3aed',
        secondary: '#0891b2',
        accent:    '#059669',
        bg:        '#faf5ff',
        surface:   '#ffffff',
        border:    '#e9d5ff',
        text:      '#4c1d95',
        textMuted: '#7c3aed',
      }
    },
    features: {
      contextRecall:      true,
      voicePipeline:      true,
      cognitiveGraph:     true,
      tabGuardian:        true,
      timeline:           true,
      focusMode:          true,
      focusReport:        true,
      systemHealth:       false,
      productivityMatrix: false,
      childSafeMode:      false,
      studyTracker:       true,
      breakReminder:      true,
      burnoutWarning:     true,
      achievementBadges:  true,
      memoryAid:          false,
      screenTimeGuard:    false,
      examCountdown:      true,
      subjectTracker:     true,
      studyStreak:        true,
    }
  },

  parent: {
    id:          'parent',
    label:       'Parent',
    emoji:       '👨👩👧',
    description: 'Monitor and protect your child online',
    tone:        'warm',
    colors: {
      dark: {
        primary:   '#38bdf8',
        secondary: '#34d399',
        accent:    '#fb923c',
        bg:        '#082f49',
        surface:   '#0c4a6e',
        border:    '#075985',
        text:      '#f0f9ff',
        textMuted: '#94a3b8',
      },
      light: {
        primary:   '#0ea5e9',
        secondary: '#10b981',
        accent:    '#f97316',
        bg:        '#f0f9ff',
        surface:   '#ffffff',
        border:    '#bae6fd',
        text:      '#0c4a6e',
        textMuted: '#64748b',
      }
    },
    features: {
      contextRecall:      false,
      voicePipeline:      false,
      cognitiveGraph:     false,
      tabGuardian:        false,
      timeline:           true,
      focusMode:          false,
      focusReport:        true,
      systemHealth:       false,
      productivityMatrix: false,
      childSafeMode:      true,
      studyTracker:       true,
      breakReminder:      false,
      burnoutWarning:     false,
      achievementBadges:  false,
      memoryAid:          false,
      screenTimeGuard:    true,
      childDashboard:     true,
      appBlocker:         true,
      screenTimeLimit:    true,
      weeklyChildReport:  true,
    }
  },

  child: {
    id:          'child',
    label:       'Child',
    emoji:       '🧒',
    description: 'Safe, fun, and encouraging for kids',
    tone:        'playful',
    colors: {
      dark: {
        primary:   '#fb7185',
        secondary: '#a78bfa',
        accent:    '#fcd34d',
        bg:        '#2e1025',
        surface:   '#4c1d95',
        border:    '#7c3aed',
        text:      '#fdf4ff',
        textMuted: '#c4b5fd',
      },
      light: {
        primary:   '#f43f5e',
        secondary: '#8b5cf6',
        accent:    '#fbbf24',
        bg:        '#fdf4ff',
        surface:   '#ffffff',
        border:    '#e9d5ff',
        text:      '#581c87',
        textMuted: '#7c3aed',
      }
    },
    features: {
      contextRecall:      false,
      voicePipeline:      true,
      cognitiveGraph:     false,
      tabGuardian:        true,
      timeline:           false,
      focusMode:          true,
      focusReport:        false,
      systemHealth:       false,
      productivityMatrix: false,
      childSafeMode:      true,
      studyTracker:       true,
      breakReminder:      true,
      burnoutWarning:     false,
      achievementBadges:  true,
      memoryAid:          false,
      screenTimeGuard:    true,
      rewardSystem:       true,
      friendlyReminders:  true,
      safeSearch:         true,
      funTimer:           true,
    }
  },

  senior: {
    id:          'senior',
    label:       'Senior',
    emoji:       '👴',
    description: 'Simple, clear, helpful memory assistance',
    tone:        'gentle',
    colors: {
      dark: {
        primary:   '#60a5fa',
        secondary: '#34d399',
        accent:    '#f87171',
        bg:        '#020617',
        surface:   '#0f172a',
        border:    '#1e293b',
        text:      '#f8fafc',
        textMuted: '#94a3b8',
      },
      light: {
        primary:   '#2563eb',
        secondary: '#059669',
        accent:    '#dc2626',
        bg:        '#f8fafc',
        surface:   '#ffffff',
        border:    '#cbd5e1',
        text:      '#1e293b',
        textMuted: '#475569',
      }
    },
    features: {
      contextRecall:      true,
      voicePipeline:      true,
      cognitiveGraph:     false,
      tabGuardian:        false,
      timeline:           true,
      focusMode:          false,
      focusReport:        false,
      systemHealth:       false,
      productivityMatrix: false,
      childSafeMode:      false,
      studyTracker:       false,
      breakReminder:      true,
      burnoutWarning:     false,
      achievementBadges:  false,
      memoryAid:          true,
      screenTimeGuard:    false,
      largeText:          true,
      simpleUI:           true,
      healthReminders:    true,
      voiceFirst:         true,
      reminderSystem:     true,
    }
  },

  employee: {
    id:          'employee',
    label:       'Employee',
    emoji:       '👔',
    description: 'Boost your performance and wellbeing at work',
    tone:        'motivational',
    colors: {
      dark: {
        primary:   '#0891b2',
        secondary: '#7c3aed',
        accent:    '#16a34a',
        bg:        '#0a0f1e',
        surface:   '#111827',
        border:    '#1f2937',
        text:      '#f9fafb',
        textMuted: '#9ca3af',
      },
      light: {
        primary:   '#06b6d4',
        secondary: '#8b5cf6',
        accent:    '#22c55e',
        bg:        '#ecfeff',
        surface:   '#ffffff',
        border:    '#cffafe',
        text:      '#164e63',
        textMuted: '#64748b',
      }
    },
    features: {
      contextRecall:      true,
      voicePipeline:      true,
      cognitiveGraph:     true,
      tabGuardian:        true,
      timeline:           true,
      focusMode:          true,
      focusReport:        true,
      systemHealth:       true,
      productivityMatrix: true,
      childSafeMode:      false,
      studyTracker:       false,
      breakReminder:      true,
      burnoutWarning:     true,
      achievementBadges:  true,
      memoryAid:          false,
      screenTimeGuard:    false,
      dailyGoals:         true,
      performanceScore:   true,
      motivationEngine:   true,
      workLifeBalance:    true,
      peerComparison:     false,
      personalCoach:      true,
    }
  },

  manager: {
    id:          'manager',
    label:       'Manager',
    emoji:       '🏢',
    description: 'WorkSense dashboard — team productivity and focus intelligence',
    tone:        'professional',
    colors: {
      dark: {
        primary:   '#14b8a6',
        secondary: '#6366f1',
        accent:     '#f59e0b',
        bg:         '#0a0f1e',
        surface:    '#111827',
        border:     '#1f2937',
        text:       '#f9fafb',
        textMuted:  '#9ca3af',
      },
      light: {
        primary:   '#0d9488',
        secondary: '#4f46e5',
        accent:     '#d97706',
        bg:         '#ecfeff',
        surface:    '#ffffff',
        border:     '#cffafe',
        text:       '#164e63',
        textMuted:  '#64748b',
      }
    },
    features: {
      contextRecall:      false,
      voicePipeline:       false,
      cognitiveGraph:      false,
      tabGuardian:         false,
      timeline:            true,
      focusMode:           false,
      focusReport:         true,
      systemHealth:        true,
      productivityMatrix:  true,
      managerDashboard:    true,
      worksenseLive:       true,
      powerMonitor:        true,
      cpuAlerts:           true,
    }
  }
}

const ModeContext = createContext()

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() =>
    localStorage.getItem('cos_mode') || null
  )

  const { theme } = useTheme()

  const selectMode = (modeId) => {
    localStorage.setItem('cos_mode', modeId)
    setMode(modeId)
    try {
      fetch('/mode/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: modeId })
      }).catch(() => {})
    } catch(e) {}
  }

  const baseMode = MODES[mode] || null
  const currentMode = baseMode ? {
    ...baseMode,
    colors: baseMode.colors[theme?.dark ? 'dark' : 'light'] || baseMode.colors
  } : null

  return (
    <ModeContext.Provider value={{ mode, currentMode, selectMode, MODES }}>
      {children}
    </ModeContext.Provider>
  )
}

export const useMode = () => useContext(ModeContext)
