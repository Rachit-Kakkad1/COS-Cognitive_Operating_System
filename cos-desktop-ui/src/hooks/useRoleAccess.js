// useRoleAccess.js
// Central hook — checks if current role can access a feature
// Used by RoleGuard, RoleNavBar, and all page components

import { useMode } from '../context/ModeContext'

const ROLE_PERMISSIONS = {
  professional: [
    'home', 'recall', 'timeline', 'cognitive_graph',
    'tab_guardian', 'focus_report', 'system_health',
    'focus_mode', 'break_reminder', 'burnout_warning',
    'voice_pipeline', 'drift_detection', 'chrome_extension'
  ],
  student: [
    'home', 'recall', 'timeline', 'cognitive_graph',
    'tab_guardian', 'focus_report', 'focus_mode',
    'study_tracker', 'exam_countdown', 'study_streak',
    'achievement_badges', 'break_reminder', 'burnout_warning',
    'voice_pipeline', 'reward_system', 'subject_tracker'
  ],
  child: [
    'home', 'child_dashboard', 'study_tracker',
    'fun_timer', 'reward_system', 'achievement_badges',
    'voice_pipeline', 'tab_guardian', 'break_reminder',
    'safe_search', 'subject_planets'
  ],
  senior: [
    'home', 'recall', 'timeline', 'memory_aid',
    'voice_pipeline', 'health_reminders',
    'break_reminder', 'reminder_system', 'simple_recall'
  ],
  parent: [
    'home', 'child_monitoring', 'screen_time_controls',
    'app_blocker', 'weekly_child_report', 'timeline',
    'focus_report', 'study_tracker'
  ],
  employee: [
    'home', 'recall', 'timeline', 'cognitive_graph',
    'tab_guardian', 'focus_report', 'system_health',
    'focus_mode', 'voice_pipeline', 'achievement_badges',
    'daily_goals', 'performance_score', 'burnout_warning',
    'break_reminder', 'work_life_balance', 'personal_coach'
  ],
  manager: [
    'home', 'manager_dashboard', 'productivity_matrix',
    'focus_intelligence', 'system_health', 'timeline',
    'org_setup', 'employee_credentials', 'reports',
    'worksense_live', 'power_monitor', 'cpu_alerts'
  ]
}

// Human-readable blocked messages per role (friendly, no technical jargon for child/senior)
const BLOCKED_MESSAGES = {
  child: {
    default: 'This section is for grown-ups only! 🧒',
    parent_controls: 'Only your parent can see this! 👨‍👩‍👧',
    manager_dashboard: 'This is for managers at work! 🏢',
    cognitive_graph: 'This feature unlocks when you grow up! 🌱',
    system_health: 'Ask a grown-up for help with this! 🛠️'
  },
  parent: {
    default: "This section is for your child's view only.",
    child_dashboard: "Switch to your child's profile to see this.",
    reward_system: "This is your child's reward space — not yours!",
    fun_timer: "This is designed for children's study sessions.",
    manager_dashboard: 'This requires a WorkSense account.'
  },
  senior: {
    default: "This feature isn't part of your setup.",
    cognitive_graph: "This isn't needed for your account.",
    tab_guardian: "This feature isn't set up for your profile.",
    manager_dashboard: 'This is for workplace accounts only.',
    study_tracker: 'This is designed for students.'
  },
  student: {
    default: "This isn't available in Student mode.",
    parent_controls: 'This is for parents only.',
    manager_dashboard: 'This requires a WorkSense business account.',
    system_health: 'This is available in Professional mode.'
  },
  professional: {
    default: "This feature isn't in Professional mode.",
    study_tracker: 'Switch to Student mode for study features.',
    child_dashboard: 'This is designed for children.',
    parent_controls: 'This is designed for parents.',
    manager_dashboard: 'This requires a WorkSense business account.'
  },
  employee: {
    default: "This isn't available in Employee mode.",
    manager_dashboard: 'Only managers can access this dashboard.',
    productivity_matrix: 'Only managers can view team productivity.',
    child_dashboard: 'This is designed for children.',
    org_setup: 'Only managers can set up the organisation.'
  },
  manager: {
    default: "This isn't available in Manager mode.",
    child_dashboard: 'This is designed for children.',
    study_tracker: 'This is designed for students.',
    memory_aid: 'This is designed for seniors.',
    reward_system: 'This is designed for students and children.'
  }
}

export const useRoleAccess = () => {
  const { mode } = useMode()

  const canAccess = (feature) => {
    if (!mode) return false
    const allowed = ROLE_PERMISSIONS[mode] || []
    return allowed.includes(feature)
  }

  const getBlockedMessage = (feature) => {
    if (!mode) return 'Please select your mode first.'
    const messages = BLOCKED_MESSAGES[mode] || {}
    return messages[feature] || messages.default ||
      "This feature isn't available in your current mode."
  }

  const getHomeRoute = () => {
    return mode ? '/home' : '/mode-select'
  }

  return { canAccess, getBlockedMessage, getHomeRoute, role: mode }
}

export default useRoleAccess
