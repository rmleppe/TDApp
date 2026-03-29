import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'

export type TimerMode = 'work' | 'break'

export interface TimerPreset {
  label: string
  seconds: number
}

export const WORK_PRESETS: TimerPreset[] = [
  { label: '25 min', seconds: 25 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '1 hora', seconds: 60 * 60 },
]

export const BREAK_PRESETS: TimerPreset[] = [
  { label: '5 min',  seconds: 5  * 60 },
  { label: '15 min', seconds: 15 * 60 },
]

interface TimerContextValue {
  mode: TimerMode
  running: boolean
  seconds: number
  total: number
  workPreset: TimerPreset
  breakPreset: TimerPreset
  setWorkPreset: (p: TimerPreset) => void
  setBreakPreset: (p: TimerPreset) => void
  play: () => void
  pause: () => void
  reset: () => void
  switchMode: (mode: TimerMode) => void
  focusMode: boolean
  toggleFocusMode: () => void
}

const TimerContext = createContext<TimerContextValue | null>(null)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [mode, setMode]               = useState<TimerMode>('work')
  const [workPreset, setWorkPresetState]   = useState<TimerPreset>(WORK_PRESETS[0])
  const [breakPreset, setBreakPresetState] = useState<TimerPreset>(BREAK_PRESETS[0])
  const [seconds, setSeconds]         = useState(WORK_PRESETS[0].seconds)
  const [total, setTotal]             = useState(WORK_PRESETS[0].seconds)
  const [running, setRunning]         = useState(false)
  const [focusMode, setFocusMode]     = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const toggleFocusMode = () => setFocusMode((f) => !f)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const play  = () => setRunning(true)
  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    const t = mode === 'work' ? workPreset.seconds : breakPreset.seconds
    setSeconds(t)
    setTotal(t)
  }

  const setWorkPreset = (p: TimerPreset) => {
    setWorkPresetState(p)
    if (mode === 'work') {
      setRunning(false)
      setSeconds(p.seconds)
      setTotal(p.seconds)
    }
  }

  const setBreakPreset = (p: TimerPreset) => {
    setBreakPresetState(p)
    if (mode === 'break') {
      setRunning(false)
      setSeconds(p.seconds)
      setTotal(p.seconds)
    }
  }

  const switchMode = (m: TimerMode) => {
    setMode(m)
    setRunning(false)
    const t = m === 'work' ? workPreset.seconds : breakPreset.seconds
    setSeconds(t)
    setTotal(t)
  }

  return (
    <TimerContext.Provider value={{
      mode, running, seconds, total,
      workPreset, breakPreset,
      setWorkPreset, setBreakPreset,
      play, pause, reset, switchMode,
      focusMode, toggleFocusMode,
    }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used inside TimerProvider')
  return ctx
}
