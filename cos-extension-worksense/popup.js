document.addEventListener("DOMContentLoaded", () => {
// A. Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
    tab.classList.add('active')
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active')
    
    // Load data for that tab
    if (tab.dataset.tab === 'dashboard')    loadDashboard()
    if (tab.dataset.tab === 'focus')        loadFocusReport()
    if (tab.dataset.tab === 'productivity') loadProductivityMatrix()
    if (tab.dataset.tab === 'system')       loadSystemHealth()
  })
})

// B. Dashboard tab
async function loadDashboard() {
  const { managerToken, empToken } = await chrome.storage.local.get(['managerToken','empToken'])
  const token = managerToken || empToken
  if (!token) {
    document.getElementById('employee-list').innerHTML =
      '<div class="error">Not logged in — <a href="http://localhost:5173/auth?mode=worksense" target="_blank">Login</a></div>'
    return
  }
  try {
    const res  = await fetch('http://localhost:8000/worksense/manager/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })
    const data = await res.json()
    document.getElementById('employee-list').innerHTML =
      data.employees.map(emp => `
        <div class="emp-row">
          <div class="emp-info">
            <span class="emp-name">${emp.name || emp.emp_code}</span>
            <span class="emp-context">${emp.current_app} — ${emp.current_title?.slice(0,30)}</span>
          </div>
          <div class="emp-status">
            <span class="focus-score">${emp.focus_score}</span>
            <span class="status-dot ${emp.status_color}"></span>
          </div>
        </div>
      `).join('')
  } catch (e) {
    document.getElementById('employee-list').innerHTML = '<div class="error">Backend offline</div>'
  }
}

// C. Focus Report tab
async function loadFocusReport() {
  const { focusReport } = await chrome.storage.local.get(['focusReport'])
  if (!focusReport) {
    document.getElementById('focus-report').innerHTML = '<div class="muted">No report yet — generates daily at 6pm</div>'
  } else {
    document.getElementById('focus-report').innerHTML = `
      <div class="report-row">
        <span class="report-label">Team score</span>
        <span class="report-value">${focusReport.team_overview?.avg_focus_score}/100</span>
      </div>
      <div class="report-row">
        <span class="report-label">Deep focus sessions</span>
        <span class="report-value">${focusReport.team_overview?.deep_focus_sessions}</span>
      </div>
      <div class="report-row">
        <span class="report-label">Most productive hour</span>
        <span class="report-value">${focusReport.team_overview?.most_productive_hour}</span>
      </div>
      <div class="report-row">
        <span class="report-label">Context switches</span>
        <span class="report-value">${focusReport.team_overview?.total_switches}</span>
      </div>
      <div class="report-divider"></div>
      <div class="report-label">Top performer</div>
      <div class="report-highlight">${focusReport.top_performers?.[0]?.name || 'N/A'}</div>
      <div class="report-label" style="margin-top:8px">Needs attention</div>
      <div class="report-highlight red">${focusReport.needs_attention?.[0]?.name || 'None'}</div>
    `
  }

  document.getElementById('generate-report').onclick = async () => {
    const { managerToken } = await chrome.storage.local.get(['managerToken'])
    if (!managerToken) return
    try {
      const res = await fetch('http://localhost:8000/worksense/manager/report/daily', { headers: { 'Authorization': `Bearer ${managerToken}` } })
      const report = await res.json()
      await chrome.storage.local.set({ focusReport: report })
      loadFocusReport()
    } catch {}
  }
}

// D. Productivity Matrix tab
async function loadProductivityMatrix() {
  const { managerToken } = await chrome.storage.local.get(['managerToken'])
  if (!managerToken) {
    document.getElementById('productivity-matrix').innerHTML = '<div class="muted">Manager login required</div>'
    return
  }
  try {
    const res  = await fetch('http://localhost:8000/worksense/manager/productivity-matrix', { headers: { 'Authorization': `Bearer ${managerToken}` } })
    const data = await res.json()
    document.getElementById('productivity-matrix').innerHTML =
      data.employees.map(emp => `
        <div class="matrix-row">
          <div class="matrix-header">
            <span class="emp-name">${emp.name || emp.emp_code}</span>
            <span class="matrix-score ${emp.score_class}">${emp.productivity_score}/100</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${emp.score_class}" style="width:${emp.productivity_score}%"></div>
          </div>
          <div class="matrix-tip">💡 ${emp.improvement_tip}</div>
        </div>
      `).join('')
  } catch (e) {
    document.getElementById('productivity-matrix').innerHTML = '<div class="error">Backend offline</div>'
  }
}

// E. System Health tab
async function loadSystemHealth() {
  // CPU
  try {
    chrome.system.cpu.getInfo((cpuInfo) => {
      const usage = cpuInfo.processors.reduce((acc, proc) => {
        const total = Object.values(proc.usage).reduce((a,b) => a+b, 0)
        return acc + ((total - proc.usage.idle) / total * 100)
      }, 0) / cpuInfo.processors.length

      const pct = usage.toFixed(0)
      document.getElementById('cpu-value').textContent = pct + '%'
      document.getElementById('cpu-bar').style.width   = pct + '%'
      document.getElementById('cpu-bar').style.background = usage >= 85 ? '#ef4444' : usage >= 60 ? '#eab308' : '#6366f1'

      if (usage >= 85) {
        document.getElementById('cpu-alert').classList.remove('hidden')
      }
    })
  } catch {}

  // Power drain
  const { powerDrainReport } = await chrome.storage.local.get(['powerDrainReport'])
  if (powerDrainReport) {
    document.getElementById('power-list').innerHTML =
      powerDrainReport.map((tab, i) => `
        <div class="power-row">
          <span class="power-rank">${i+1}</span>
          <span class="power-title">${tab.title?.slice(0,28) || 'Unknown'}</span>
          <span class="power-score ${tab.score >= 80 ? 'red' : tab.score >= 50 ? 'yellow' : 'green'}">
            ${tab.score}/100
          </span>
        </div>
      `).join('')
  }

  // Kill tab button
  document.getElementById('kill-tab-btn').addEventListener('click', async () => {
    const { cpuSpike } = await chrome.storage.local.get(['cpuSpike'])
    if (cpuSpike?.tabId) {
      chrome.tabs.remove(cpuSpike.tabId)
      document.getElementById('cpu-alert').classList.add('hidden')
    }
  })

  // Refresh button
  document.getElementById('refresh-system').onclick = () => {
    chrome.runtime.getBackgroundPage && chrome.runtime.getBackgroundPage(bg => {
        bg && bg.checkSystemHealth && bg.checkSystemHealth()
        bg && bg.checkPowerDrain && bg.checkPowerDrain()
    });
    setTimeout(loadSystemHealth, 1500)
  }
}

// Initial load
loadDashboard()
pingBackend()

async function pingBackend() {
  try {
    await fetch('http://localhost:8000/health')
    document.getElementById('status-dot').className = 'dot online'
  } catch {
    document.getElementById('status-dot').className = 'dot offline'
  }
}
});
