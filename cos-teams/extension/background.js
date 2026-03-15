chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SET_MEMBER_TOKEN' && msg.token) {
    chrome.storage.local.set({ cos_teams_member_token: msg.token }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'GET_MEMBER_TOKEN') {
    chrome.storage.local.get('cos_teams_member_token', data => sendResponse({ token: data.cos_teams_member_token }));
    return true;
  }
});
