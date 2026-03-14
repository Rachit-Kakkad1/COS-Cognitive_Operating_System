/**
 * COS Chrome Extension — Popup Script
 *
 * Wires all UI elements: current tab, time spent, counts, status dot, buttons.
 */

const BACKEND_URL = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", async () => {
  const currentTabEl = document.getElementById("current-tab");
  const timeSpentEl = document.getElementById("time-spent");
  const snapshotCountEl = document.getElementById("snapshot-count");
  const queueCountEl = document.getElementById("queue-count");
  const statusDot = document.getElementById("status-dot");
  const captureBtn = document.getElementById("capture-now");
  const openCosBtn = document.getElementById("open-cos");
  const autoCaptureToggle = document.getElementById("auto-capture-toggle");
  const lastCaptureTimeEl = document.getElementById("last-capture-time");

  // ─── Current tab title ──────────────────────────────────────────────
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentTabEl.textContent = tab.title || tab.url || "Unknown";
    }
  } catch {
    currentTabEl.textContent = "Unable to read tab";
  }

  // ─── Backend health check → green/red dot ───────────────────────────
  try {
    const resp = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (resp.ok) {
      statusDot.classList.remove("offline");
      statusDot.classList.add("online");
    }
  } catch {
    statusDot.classList.remove("online");
    statusDot.classList.add("offline");
  }

  // ─── Time spent on current tab ──────────────────────────────────────
  try {
    const data = await chrome.storage.local.get("active_tab");
    if (data.active_tab && data.active_tab.activatedAt) {
      const seconds = Math.round((Date.now() - data.active_tab.activatedAt) / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeSpentEl.textContent = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
  } catch {
    timeSpentEl.textContent = "—";
  }

  // ─── Snapshot count today ───────────────────────────────────────────
  try {
    const today = new Date().toDateString();
    const data = await chrome.storage.local.get("snapshot_counts");
    const counts = data.snapshot_counts || {};
    snapshotCountEl.textContent = String(counts[today] || 0);
  } catch {
    snapshotCountEl.textContent = "0";
  }

  // ─── Offline queue count ────────────────────────────────────────────
  try {
    const data = await chrome.storage.local.get("offline_queue");
    const queue = data.offline_queue || [];
    queueCountEl.textContent = String(queue.length);
  } catch {
    queueCountEl.textContent = "0";
  }

  // ─── Auto-Capture Toggle ────────────────────────────────────────────
  try {
    const data = await chrome.storage.local.get({ auto_capture_enabled: true });
    autoCaptureToggle.checked = data.auto_capture_enabled;
  } catch {}

  autoCaptureToggle.addEventListener("change", async () => {
    await chrome.storage.local.set({ auto_capture_enabled: autoCaptureToggle.checked });
  });

  // ─── Last Capture Time ──────────────────────────────────────────────
  const updateLastCapture = async () => {
    try {
      const data = await chrome.storage.local.get("last_capture_ts");
      if (data.last_capture_ts) {
        const diff = Math.round((Date.now() - data.last_capture_ts) / 1000);
        if (diff < 60) lastCaptureTimeEl.textContent = `${diff}s ago`;
        else lastCaptureTimeEl.textContent = `${Math.floor(diff / 60)}m ago`;
      }
    } catch {}
  };
  updateLastCapture();
  setInterval(updateLastCapture, 10000);

  // ─── Capture Now button ─────────────────────────────────────────────
  captureBtn.addEventListener("click", async () => {
    captureBtn.textContent = "Capturing...";
    captureBtn.disabled = true;
    try {
      await chrome.runtime.sendMessage({ type: "CAPTURE_NOW" });
      captureBtn.textContent = "✓ Captured!";
      setTimeout(() => {
        captureBtn.textContent = "Capture Now";
        captureBtn.disabled = false;
      }, 1500);
    } catch {
      captureBtn.textContent = "Error";
      setTimeout(() => {
        captureBtn.textContent = "Capture Now";
        captureBtn.disabled = false;
      }, 1500);
    }
  });

  // ─── Open COS button ───────────────────────────────────────────────
  openCosBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  });
});
