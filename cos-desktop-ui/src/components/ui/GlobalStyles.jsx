export const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #080810;
      color: #f0f0ff;
      font-family: -apple-system, 'SF Pro Display',
                   'Inter', sans-serif;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track  { background: #080810; }
    ::-webkit-scrollbar-thumb  { background: #1e1e36;
                                  border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #2a2a4a; }
    input, button { font-family: inherit; }
    @keyframes pulse {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.4; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}} />
)