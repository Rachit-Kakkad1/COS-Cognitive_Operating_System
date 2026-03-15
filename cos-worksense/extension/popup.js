const BACKEND = 'http://localhost:8003';

document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'dashboard') loadDashboard();
    if (btn.dataset.tab === 'focus') loadFocus();
    if (btn.dataset.tab === 'productivity') loadProductivity();
    if (btn.dataset.tab === 'system') loadSystem();
  });
});

function loadDashboard() {
  chrome.storage.local.get(['ws_manager_token'], (r) => {
    const token = r.ws_manager_token;
    if (!token) { document.getElementById('dashboard-list').innerHTML = '<p>Manager login required. Open app at localhost:5176</p>'; return; }
    fetch(BACKEND + '/manager/dashboard', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(d => {
        const list = (d.employees || []).slice(0, 8).map(e => `<div style="margin:6px 0">${e.name || e.emp_code} · ${e.current_app} · ${e.focus_score}</div>`).join('');
        document.getElementById('dashboard-list').innerHTML = list || 'No data';
      })
      .catch(() => { document.getElementById('dashboard-list').innerHTML = 'Backend offline'; });
  });
}

function loadFocus() {
  chrome.storage.local.get(['ws_manager_token', 'ws_emp_token'], (r) => {
    const token = r.ws_manager_token || r.ws_emp_token;
    if (!token) { document.getElementById('focus-summary').innerHTML = 'Sign in first'; return; }
    fetch(BACKEND + '/manager/focus-intelligence?period=today', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(d => {
        document.getElementById('focus-summary').innerHTML = `Team score: ${d.org_avg_score ?? '—'}`;
      })
      .catch(() => { document.getElementById('focus-summary').innerHTML = '—'; });
  });
}

document.getElementById('focus-generate')?.addEventListener('click', loadFocus);

function loadProductivity() {
  chrome.storage.local.get(['ws_manager_token'], (r) => {
    const token = r.ws_manager_token;
    if (!token) { document.getElementById('productivity-list').innerHTML = 'Manager only'; return; }
    fetch(BACKEND + '/manager/productivity-matrix', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(d => {
        const list = (d.employees || []).slice(0, 5).map(e => `<div style="margin:6px 0">${e.name} <span style="color:#14b8a6">${e.productivity_score}</span></div>`).join('');
        document.getElementById('productivity-list').innerHTML = list || 'No data';
      })
      .catch(() => { document.getElementById('productivity-list').innerHTML = '—'; });
  });
}

function loadSystem() {
  fetch(BACKEND + '/system/power-report')
    .then(res => res.json())
    .then(d => {
      document.getElementById('system-cpu').textContent = '⚡ CPU: ' + (d.total_cpu ?? 0).toFixed(1) + '%';
      const top = d.processes?.[0];
      document.getElementById('system-drain').textContent = '🔋 Top: ' + (top?.name || '—');
    })
    .catch(() => {
      document.getElementById('system-cpu').textContent = '⚡ CPU: —';
      document.getElementById('system-drain').textContent = '🔋 Backend offline';
    });
}

document.getElementById('system-refresh')?.addEventListener('click', loadSystem);

chrome.storage.local.get(['ws_manager_token', 'ws_emp_token'], (r) => {
  document.getElementById('role-badge').textContent = r.ws_manager_token ? 'manager' : 'employee';
  loadDashboard();
});
