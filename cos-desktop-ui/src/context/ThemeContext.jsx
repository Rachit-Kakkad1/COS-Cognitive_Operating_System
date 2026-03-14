import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('cos_theme') !== 'light'
  })

  useEffect(() => {
    localStorage.setItem('cos_theme', dark ? 'dark' : 'light')
    document.body.style.background = dark ? '#0f0f0f' : '#f5f5f5'
    document.body.style.color      = dark ? '#e0e0e0' : '#111111'
  }, [dark])

  const toggle = () => setDark(d => !d)

  const theme = {
    dark,
    bg:        dark ? '#0f0f0f' : '#ffffff',
    bgCard:    dark ? '#111111' : '#f9f9f9',
    bgInput:   dark ? '#1a1a1a' : '#f0f0f0',
    border:    dark ? '#2a2a2a' : '#e0e0e0',
    text:      dark ? '#e0e0e0' : '#111111',
    textMuted: dark ? '#a1a1aa' : '#666666',
    purple:    '#6366f1',
    teal:      '#14b8a6',
    amber:     '#f59e0b',
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
