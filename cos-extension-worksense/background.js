// WorkSense Background Service Worker

let managerToken = null;
let empToken     = null;
let orgId        = null;
let userRole     = null;

chrome.storage.local.get(
  ['managerToken','empToken','orgId','userRole'],
  (r) => {
    managerToken = r.managerToken || null;
    empToken     = r.empToken     || null;
    orgId        = r.orgId        || null;
    userRole     = r.userRole     || null;
  }
);

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.managerToken) managerToken = changes.managerToken.newValue;
    if (changes.empToken)     empToken     = changes.empToken.newValue;
    if (changes.orgId)        orgId        = changes.orgId.newValue;
    if (changes.userRole)     userRole     = changes.userRole.newValue;
  }
});

// A. Tab Tracking
let activeTabInfo = { tabId: null, url: "", title: "", activatedAt: Date.now() };

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    activeTabInfo = {
      tabId: activeInfo.tabId,
      url: tab.url || "",
      title: tab.title || "Untitled",
      activatedAt: Date.now(),
    };
  } catch {}
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabId === activeTabInfo.tabId) {
    activeTabInfo.url = tab.url || activeTabInfo.url;
    activeTabInfo.title = tab.title || activeTabInfo.title;
  }
});

// B. Capture Alarm
chrome.alarms.create('cos_ws_capture', { periodInMinutes: 0.5 });
chrome.alarms.create('cos_cpu_check', { periodInMinutes: 0.17 });
chrome.alarms.create('cos_power_check', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'cos_ws_capture') await captureAndSend();
  if (alarm.name === 'cos_cpu_check')  await checkSystemHealth();
  if (alarm.name === 'cos_power_check') await checkPowerDrain();
});

async function captureAndSend() {
  if (!empToken || !activeTabInfo.url || activeTabInfo.url.startsWith("chrome://")) return;
  
  let domText = "";
  try {
    const response = await chrome.tabs.sendMessage(activeTabInfo.tabId, { type: "GET_DOM_TEXT" });
    domText = response?.domText || "";
  } catch {}
  
  const timeSpentSeconds = Math.round((Date.now() - activeTabInfo.activatedAt) / 1000);
  
  fetch('http://localhost:8000/worksense/employee/snapshot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`
    },
    body: JSON.stringify({
      app: "Chrome",
      title: activeTabInfo.title,
      url: activeTabInfo.url,
      text: domText.slice(0, 500),
      session_minutes: Math.round(timeSpentSeconds / 60) || 0,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {});
}

// C. CPU check
async function checkSystemHealth() {
  if (!chrome.system.cpu) return;
  chrome.system.cpu.getInfo(async (cpuInfo) => {
    const usage = cpuInfo.processors.reduce((acc, proc) => {
      const total = Object.values(proc.usage).reduce((a,b) => a+b, 0)
      const idle  = proc.usage.idle
      return acc + ((total - idle) / total * 100)
    }, 0) / cpuInfo.processors.length

    console.log(`[WorkSense CPU] Usage: ${usage.toFixed(1)}%`)

    if (usage >= 85) {
      const tabs = await chrome.tabs.query({})
      const heavyTab = tabs.find(t => t.url && !t.url.startsWith('chrome://') && t.audible) || tabs[0]
      const tabTitle = heavyTab?.title || 'Unknown tab'
      const tabId    = heavyTab?.id

      chrome.notifications.create('cpu_spike_' + Date.now(), {
        type:     'basic',
        iconUrl:  'icons/worksense-48.png',
        title:    '⚠️ COS WorkSense — High CPU Alert',
        message:  `CPU at ${usage.toFixed(0)}%. "${tabTitle}" may be the cause. Kill this tab?`,
        buttons:  [
          { title: '🗑️ Kill this tab' },
          { title: '✓ Ignore'         }
        ],
        requireInteraction: true,
        priority: 2
      })

      await chrome.storage.local.set({
        cpuSpike: { usage: usage.toFixed(0), tabTitle: tabTitle, tabId: tabId, time: new Date().toLocaleTimeString() }
      })

      if (empToken) {
        fetch('http://localhost:8000/worksense/employee/system-alert', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${empToken}` },
          body: JSON.stringify({ alert_type: 'cpu_spike', value: usage.toFixed(0), detail: tabTitle, timestamp: new Date().toISOString() })
        }).catch(() => {})
      }
    }
  })
}

chrome.notifications.onButtonClicked.addListener((notifId, btnIndex) => {
  if (notifId.startsWith('cpu_spike_') && btnIndex === 0) {
    chrome.storage.local.get(['cpuSpike'], (r) => {
      if (r.cpuSpike?.tabId) chrome.tabs.remove(r.cpuSpike.tabId)
    })
  }
})

// D. Power Drain
const TAB_POWER_SCORES = {
  'youtube.com':     90,
  'netflix.com':     95,
  'twitch.tv':       88,
  'figma.com':       70,
  'docs.google.com': 40,
  'github.com':      30,
  'localhost':       20,
}

async function checkPowerDrain() {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const scored = tabs.map(tab => {
    let score = 30
    const url = tab.url || ''
    for (const [domain, power] of Object.entries(TAB_POWER_SCORES)) {
      if (url.includes(domain)) { score = power; break }
    }
    if (tab.audible) score += 20
    if (tab.active)  score += 10
    return { title: tab.title, url, score, tabId: tab.id }
  }).sort((a,b) => b.score - a.score)

  const topDrain = scored[0]
  await chrome.storage.local.set({ powerDrainReport: scored.slice(0,5) })

  if (topDrain && topDrain.score >= 80) {
    chrome.notifications.create('power_drain_' + Date.now(), {
      type:    'basic',
      iconUrl: 'icons/worksense-48.png',
      title:   '🔋 COS WorkSense — High Power Usage',
      message: `"${topDrain.title}" is draining significant power (score: ${topDrain.score}/100). Consider closing it.`,
      buttons: [ { title: '🗑️ Close this tab' }, { title: '✓ Keep it' } ],
      requireInteraction: false,
      priority: 1
    })
  }
}

// E. Focus Intelligence Report
function scheduleDailyReport() {
  const now    = new Date()
  const target = new Date()
  target.setHours(18, 0, 0, 0)
  if (now > target) target.setDate(target.getDate() + 1)
  const msUntil = target - now
  setTimeout(async () => {
    await generateFocusReport()
    setInterval(generateFocusReport, 24 * 60 * 60 * 1000)
  }, msUntil)
}

async function generateFocusReport() {
  const token = managerToken || empToken
  if (!token) return
  try {
    const res    = await fetch(
      'http://localhost:8000/worksense/manager/report/daily',
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const report = await res.json()
    await chrome.storage.local.set({ focusReport: report })

    chrome.notifications.create('focus_report_' + Date.now(), {
      type:    'basic',
      iconUrl: 'icons/worksense-48.png',
      title:   '🧠 COS WorkSense — Daily Focus Report Ready',
      message: `Team score: ${report.team_overview?.avg_focus_score}/100 · Top performer: ${report.top_performers?.[0]?.name || 'N/A'}`,
      priority: 1
    })
  } catch (e) {}
}
scheduleDailyReport()
