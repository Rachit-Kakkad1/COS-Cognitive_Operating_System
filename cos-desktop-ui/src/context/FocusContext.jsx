import { createContext, useContext, useState, useEffect, useRef } from 'react'

const FocusContext = createContext()

const FOCUS_DURATION = 25 * 60

export function FocusProvider({ children }) {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setDone(true)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const start = () => { setRunning(true); setDone(false) }
  const pause = () => { setRunning(false) }
  const reset = () => {
    setRunning(false)
    setDone(false)
    setSecondsLeft(FOCUS_DURATION)
  }

  return (
    <FocusContext.Provider value={{
      secondsLeft, running, done, currentTask, setCurrentTask,
      start, pause, reset, FOCUS_DURATION
    }}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = () => useContext(FocusContext)
