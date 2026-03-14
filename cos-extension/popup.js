/**
 * COS Chrome Extension — Popup Script
 *
 * Wires all UI elements: current tab, time spent, counts, status dot, buttons.
 * Updated for premium UI layout.
 */

const BACKEND_URL = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", async () => {
  const currentTabEl = document.getElementById("current-tab");
  const timeSpentEl = document.getElementById("time-spent");
  const snapshotCountEl = document.getElementById("snapshot-count");
  const queueCountEl = document.getElementById("queue-count");
  const totalMemoriesEl = document.getElementById("total-memories");
  const statusPill = document.getElementById("status-pill");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
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

  // ─── Backend health check → status pill ─────────────────────────────
  try {
    const resp = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (resp.ok) {
      const data = await resp.json();
      statusPill.classList.add("online");
      statusText.textContent = "Live";

      // Show total memories from backend
      if (data.memories !== undefined) {
        totalMemoriesEl.textContent = String(data.memories);
      }
    }
  } catch {
    statusPill.classList.remove("online");
    statusText.textContent = "Offline";
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
        if (diff < 60) lastCaptureTimeEl.textContent = `${diff}s`;
        else if (diff < 3600) lastCaptureTimeEl.textContent = `${Math.floor(diff / 60)}m`;
        else lastCaptureTimeEl.textContent = `${Math.floor(diff / 3600)}h`;
      }
    } catch {}
  };
  updateLastCapture();
  setInterval(updateLastCapture, 10000);

  // ─── Capture Now button ─────────────────────────────────────────────
  captureBtn.addEventListener("click", async () => {
    const btnText = captureBtn.querySelector(".btn-text");
    const btnIcon = captureBtn.querySelector(".btn-icon");
    btnText.textContent = "Capturing…";
    btnIcon.textContent = "⏳";
    captureBtn.disabled = true;
    try {
      await chrome.runtime.sendMessage({ type: "CAPTURE_NOW" });
      btnText.textContent = "Captured!";
      btnIcon.textContent = "✓";
      captureBtn.classList.add("success");

      // Update count
      const today = new Date().toDateString();
      const data = await chrome.storage.local.get("snapshot_counts");
      const counts = data.snapshot_counts || {};
      snapshotCountEl.textContent = String(counts[today] || 0);

      setTimeout(() => {
        btnText.textContent = "Capture Now";
        btnIcon.textContent = "⚡";
        captureBtn.disabled = false;
        captureBtn.classList.remove("success");
      }, 1500);
    } catch {
      btnText.textContent = "Error";
      btnIcon.textContent = "✗";
      setTimeout(() => {
        btnText.textContent = "Capture Now";
        btnIcon.textContent = "⚡";
        captureBtn.disabled = false;
      }, 1500);
    }
  });

  // ─── Open COS button ───────────────────────────────────────────────
  openCosBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  });
});
