import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { FocusProvider } from './context/FocusContext'
import { ThemeProvider } from './context/ThemeContext'
import { ModeProvider } from './context/ModeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ModeProvider>
          <FocusProvider>
            <App />
          </FocusProvider>
        </ModeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
