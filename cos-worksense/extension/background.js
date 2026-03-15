const BACKEND = 'http://localhost:8003';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('ws_capture', { periodInMinutes: 0.5 });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SET_EMP_TOKEN') {
    chrome.storage.local.set({ ws_emp_token: msg.token }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'GET_EMP_TOKEN') {
    chrome.storage.local.get(['ws_emp_token'], (r) => sendResponse({ token: r.ws_emp_token }));
    return true;
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'ws_capture') {
    chrome.storage.local.get(['ws_emp_token', 'last_snapshot'], (r) => {
      if (!r.ws_emp_token) return;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.url || tab.url.startsWith('chrome://')) return;
        const key = `${tab.url}|${tab.title || ''}`;
        if (r.last_snapshot === key) return;
        fetch(`${BACKEND}/employee/snapshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${r.ws_emp_token}` },
          body: JSON.stringify({
            app: new URL(tab.url).hostname || 'Browser',
            title: tab.title || '',
            context_switches: 0,
            session_minutes: 0,
            is_idle: false,
          }),
        }).then(() => chrome.storage.local.set({ last_snapshot: key })).catch(() => {});
      });
    });
  }
});
