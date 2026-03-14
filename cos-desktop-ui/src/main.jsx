import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { FocusProvider } from './context/FocusContext'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <FocusProvider>
          <App />
        </FocusProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
