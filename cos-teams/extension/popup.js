const BACKEND = 'http://localhost:8002';

document.addEventListener('DOMContentLoaded', async () => {
  let token = (await chrome.storage.local.get('cos_teams_member_token')).cos_teams_member_token;
  if (!token) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url?.startsWith('http://localhost:5175')) {
        const results = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => localStorage.getItem('cos_teams_member_token') });
        token = results?.[0]?.result || null;
        if (token) chrome.storage.local.set({ cos_teams_member_token: token });
      }
    } catch (e) {}
  }
  const tabs = document.querySelectorAll('.tabs button');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabs.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${tab}`).classList.add('active');
      if (tab === 'team') loadTeam();
    });
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  document.getElementById('current-context').textContent = tab?.title || tab?.url || '—';

  document.getElementById('capture-now').addEventListener('click', async () => {
    if (!token) return alert('Sign in at COS Teams first.');
    try {
      await fetch(`${BACKEND}/team/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          app: 'Browser',
          title: tab?.title || '',
          text: '',
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          focus_score: 75,
          context_switches: 0,
        }),
      });
      alert('Captured.');
    } catch (e) {
      alert('Backend unreachable.');
    }
  });

  document.getElementById('generate-qr').addEventListener('click', async () => {
    if (!token) return alert('Sign in at COS Teams first.');
    const wrap = document.getElementById('qr-result');
    wrap.innerHTML = '<p style="color:#a1a1aa">Generating…</p>';
    try {
      const res = await fetch(`${BACKEND}/handoff/generate`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.qr_base64) {
        wrap.innerHTML = `<img src="${data.qr_base64}" alt="Handoff QR" width="240" height="240" />`;
      } else {
        wrap.innerHTML = '<p style="color:#ef4444">No memories to transfer.</p>';
      }
    } catch (e) {
      wrap.innerHTML = '<p style="color:#ef4444">Backend unreachable.</p>';
    }
  });

  async function loadTeam() {
    const list = document.getElementById('member-list');
    if (!token) { list.innerHTML = '<li>Sign in to see team.</li>'; return; }
    try {
      const res = await fetch(`${BACKEND}/team/members`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.members?.length) {
        list.innerHTML = data.members.map(m => `<li><span class="dot ${m.status}"></span>${m.name || m.member_code} — ${m.current_app || '—'}</li>`).join('');
      } else {
        list.innerHTML = '<li>Founder only, or no members yet.</li>';
      }
    } catch {
      list.innerHTML = '<li>Offline.</li>';
    }
  }
});
