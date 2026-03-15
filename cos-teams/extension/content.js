(function () {
  const token = localStorage.getItem('cos_teams_member_token');
  if (token && typeof chrome !== 'undefined' && chrome.runtime?.id) {
    chrome.runtime.sendMessage({ type: 'SET_MEMBER_TOKEN', token });
  }
})();
