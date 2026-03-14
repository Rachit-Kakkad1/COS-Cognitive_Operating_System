/**
 * COS Chrome Extension — Background Service Worker (Manifest V3)
 *
 * Captures: active tab URL + title + time spent + DOM text
 * Sends to: http://localhost:8000/memory every 30 seconds
 *
 * Features:
 *   A. Tab time tracking
 *   B. Automatic capture every 30 seconds via chrome.alarms
 *   C. Snapshot sending to COS backend
 *   D. Offline queue (max 50)
 *   E. Deduplication on url + title
 */

const BACKEND_URL = "http://localhost:8000";
const MAX_QUEUE_SIZE = 50;

// ─── A. Tab Time Tracking ────────────────────────────────────────────────

let activeTabInfo = { tabId: null, url: "", title: "", activatedAt: Date.now() };

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Compute time spent on previous tab
  const prevTimeSpent = Math.round((Date.now() - activeTabInfo.activatedAt) / 1000);

  // If we had a valid previous tab, send a snapshot for it
  if (activeTabInfo.url && prevTimeSpent > 2) {
    await captureAndSend(activeTabInfo.tabId, prevTimeSpent);
  }

  // Record new active tab
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    activeTabInfo = {
      tabId: activeInfo.tabId,
      url: tab.url || "",
      title: tab.title || "Untitled",
      activatedAt: Date.now(),
    };

    // Persist for popup
    await chrome.storage.local.set({ active_tab: activeTabInfo });
  } catch {
    // Tab may have closed between activation and get
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabId === activeTabInfo.tabId) {
    activeTabInfo.url = tab.url || activeTabInfo.url;
    activeTabInfo.title = tab.title || activeTabInfo.title;
    await chrome.storage.local.set({ active_tab: activeTabInfo });
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === activeTabInfo.tabId) {
    const timeSpent = Math.round((Date.now() - activeTabInfo.activatedAt) / 1000);
    if (activeTabInfo.url && timeSpent > 2) {
      await captureAndSend(tabId, timeSpent, true); // skipDom=true since tab is gone
    }
    activeTabInfo = { tabId: null, url: "", title: "", activatedAt: Date.now() };
  }
});


// ─── B. Automatic Capture Every 30 Seconds ───────────────────────────────

chrome.alarms.create("cos_capture", { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "cos_capture") {
    const timeSpent = Math.round((Date.now() - activeTabInfo.activatedAt) / 1000);
    if (activeTabInfo.url) {
      await captureAndSend(activeTabInfo.tabId, timeSpent);
    }
  }
});


// ─── Core: Capture DOM text + Send ──────────────────────────────────────

async function captureAndSend(tabId, timeSpentSeconds, skipDom = false) {
  let domText = "";

  if (!skipDom && tabId) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: "GET_DOM_TEXT" });
      domText = response?.domText || "";
    } catch {
      // Content script not injected (chrome:// pages, etc.)
    }
  }

  await sendSnapshot(activeTabInfo.url, activeTabInfo.title, domText, timeSpentSeconds);
}


// ─── C. Send Snapshot to Backend ─────────────────────────────────────────

async function sendSnapshot(url, title, domText, timeSpentSeconds) {
  // E. Deduplication
  const dedupKey = `${url}|${title}`;
  const stored = await chrome.storage.local.get("last_snapshot");
  if (stored.last_snapshot === dedupKey) {
    return; // identical to last sent — skip
  }

  // Skip internal Chrome pages
  if (!url || url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    return;
  }

  const snapshot = {
    app: "Chrome",
    title: title,
    url: url,
    text: (domText || "").slice(0, 500),
    time_spent_seconds: timeSpentSeconds,
    timestamp: new Date().toLocaleString(),
  };

  // Flush offline queue first
  await flushQueue();

  try {
    const resp = await fetch(`${BACKEND_URL}/memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });

    if (resp.ok) {
      console.log("[COS Extension] Snapshot sent:", title);
      await chrome.storage.local.set({ last_snapshot: dedupKey });

      // Increment daily counter
      const today = new Date().toDateString();
      const counts = await chrome.storage.local.get("snapshot_counts");
      const c = counts.snapshot_counts || {};
      c[today] = (c[today] || 0) + 1;
      await chrome.storage.local.set({ snapshot_counts: c });
    } else {
      throw new Error(`HTTP ${resp.status}`);
    }
  } catch (e) {
    console.warn("[COS Extension] Backend offline — snapshot queued");
    await queueSnapshot(snapshot);
  }
}


// ─── D. Offline Queue ────────────────────────────────────────────────────

async function queueSnapshot(snapshot) {
  const data = await chrome.storage.local.get("offline_queue");
  const queue = data.offline_queue || [];
  queue.push(snapshot);

  // Drop oldest if exceeded max
  while (queue.length > MAX_QUEUE_SIZE) {
    queue.shift();
  }

  await chrome.storage.local.set({ offline_queue: queue });
}

async function flushQueue() {
  const data = await chrome.storage.local.get("offline_queue");
  const queue = data.offline_queue || [];
  if (queue.length === 0) return;

  console.log(`[COS Extension] Flushing ${queue.length} queued snapshots`);

  const remaining = [];
  for (const snap of queue) {
    try {
      const resp = await fetch(`${BACKEND_URL}/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snap),
      });
      if (!resp.ok) {
        remaining.push(snap);
      }
    } catch {
      remaining.push(snap);
      break; // Backend still down, stop trying
    }
  }

  await chrome.storage.local.set({ offline_queue: remaining });
}


// ─── Message listener (for popup "Capture Now" button) ──────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CAPTURE_NOW") {
    const timeSpent = Math.round((Date.now() - activeTabInfo.activatedAt) / 1000);
    captureAndSend(activeTabInfo.tabId, timeSpent).then(() => {
      sendResponse({ ok: true });
    });
    return true; // async response
  }
});


console.log("[COS Extension] Background service worker started.");
