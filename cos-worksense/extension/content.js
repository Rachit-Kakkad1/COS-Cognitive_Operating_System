(function() {
  try {
    const token = localStorage.getItem('ws_emp_token');
    if (token) {
      chrome.runtime.sendMessage({ type: 'SET_EMP_TOKEN', token });
    }
  } catch (e) {}
})();
