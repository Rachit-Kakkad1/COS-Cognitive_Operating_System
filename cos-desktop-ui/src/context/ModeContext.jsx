import { createContext, useContext, useState, useEffect } from 'react'

export const MODES = {
  professional: {
    id:          'professional',
    label:       'Professional',
    emoji:       '👨💻',
    description: 'For developers, founders, knowledge workers',
    tone:        'technical',
    colors: {
      primary:   '#6366f1',
      secondary: '#14b8a6',
      accent:    '#f59e0b',
      bg:        '#0f0f0f',
      surface:   '#1a1a1a',
      border:    '#2a2a2a',
      text:      '#ffffff',
      textMuted: '#a1a1aa',
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
      primary:   '#8b5cf6',
      secondary: '#06b6d4',
      accent:    '#10b981',
      bg:        '#0d0d1a',
      surface:   '#13132a',
      border:    '#1e1e3a',
      text:      '#f0f0ff',
      textMuted: '#8888bb',
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
      primary:   '#0ea5e9',
      secondary: '#10b981',
      accent:    '#f97316',
      bg:        '#f0f9ff',
      surface:   '#ffffff',
      border:    '#bae6fd',
      text:      '#0c4a6e',
      textMuted: '#64748b',
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
      primary:   '#f43f5e',
      secondary: '#8b5cf6',
      accent:    '#fbbf24',
      bg:        '#fdf4ff',
      surface:   '#ffffff',
      border:    '#e9d5ff',
      text:      '#581c87',
      textMuted: '#7c3aed',
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
      primary:   '#2563eb',
      secondary: '#059669',
      accent:    '#dc2626',
      bg:        '#f8fafc',
      surface:   '#ffffff',
      border:    '#cbd5e1',
      text:      '#1e293b',
      textMuted: '#475569',
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
      primary:   '#0891b2',
      secondary: '#7c3aed',
      accent:    '#16a34a',
      bg:        '#0a0f1e',
      surface:   '#111827',
      border:    '#1f2937',
      text:      '#f9fafb',
      textMuted: '#9ca3af',
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
  }
}

const ModeContext = createContext()

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() =>
    localStorage.getItem('cos_mode') || null
  )

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

  const currentMode = MODES[mode] || null

  return (
    <ModeContext.Provider value={{ mode, currentMode, selectMode, MODES }}>
      {children}
    </ModeContext.Provider>
  )
}

export const useMode = () => useContext(ModeContext)
