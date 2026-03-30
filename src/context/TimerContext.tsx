import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'

export type TimerMode = 'work' | 'break'

export interface TimerPreset {
  label: string
  seconds: number
}

export const WORK_PRESETS: TimerPreset[] = [
  { label: '30 s',   seconds: 30 },
  { label: '25 min', seconds: 25 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '1 hora', seconds: 60 * 60 },
]

export const BREAK_PRESETS: TimerPreset[] = [
  { label: '5 min',  seconds: 5  * 60 },
  { label: '15 min', seconds: 15 * 60 },
]

/* ── Audio ──────────────────────────────────────────────────────────── */
function playFinishSound() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.38, 0.76].forEach((offset) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + offset) // C6
      gain.gain.setValueAtTime(0.32, ctx.currentTime + offset)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.55)
      osc.start(ctx.currentTime + offset)
      osc.stop(ctx.currentTime + offset + 0.55)
    })
  } catch (_) { /* AudioContext not available */ }
}


/* ── Context types ───────────────────────────────────────────────────── */
interface TimerContextValue {
  mode: TimerMode
  running: boolean
  seconds: number
  total: number
  finished: boolean
  autoSwitch: boolean
  toggleAutoSwitch: () => void
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
  const [mode, setMode]                    = useState<TimerMode>('work')
  const [workPreset, setWorkPresetState]   = useState<TimerPreset>(WORK_PRESETS[0])
  const [breakPreset, setBreakPresetState] = useState<TimerPreset>(BREAK_PRESETS[0])
  const [seconds, setSeconds]              = useState(WORK_PRESETS[0].seconds)
  const [total, setTotal]                  = useState(WORK_PRESETS[0].seconds)
  const [running, setRunning]              = useState(false)
  const [finished, setFinished]            = useState(false)
  const [autoSwitch, setAutoSwitchState]   = useState(
    () => localStorage.getItem('timer-autoswitch') !== 'false'
  )
  const [focusMode, setFocusMode]          = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keeps latest values accessible in the finish effect without extra deps
  const finishRef = useRef({ mode, autoSwitch, workPreset, breakPreset })
  finishRef.current = { mode, autoSwitch, workPreset, breakPreset }

  const toggleFocusMode = () => setFocusMode((f) => !f)

  /* ── Countdown interval ─────────────────────────────────────────── */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false)
            setFinished(true)
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

  /* ── On finish: sound + notification + auto-switch ──────────────── */
  useEffect(() => {
    if (!finished) return

    const { mode: m, autoSwitch: auto, workPreset: wp, breakPreset: bp } = finishRef.current

    playFinishSound()

    if (auto) {
      const nextMode: TimerMode = m === 'work' ? 'break' : 'work'
      const t = nextMode === 'work' ? wp.seconds : bp.seconds
      const id = setTimeout(() => {
        setMode(nextMode)
        setSeconds(t)
        setTotal(t)
        setFinished(false)
        setRunning(true)
      }, 3000)
      return () => clearTimeout(id)
    }
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Actions ────────────────────────────────────────────────────── */
  const play = () => {
    if (finished) {
      // Switch to next mode and start immediately
      const { mode: m, workPreset: wp, breakPreset: bp } = finishRef.current
      const nextMode: TimerMode = m === 'work' ? 'break' : 'work'
      const t = nextMode === 'work' ? wp.seconds : bp.seconds
      setMode(nextMode)
      setSeconds(t)
      setTotal(t)
      setFinished(false)
      setRunning(true)
      return
    }
    setRunning(true)
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setFinished(false)
    const t = mode === 'work' ? workPreset.seconds : breakPreset.seconds
    setSeconds(t)
    setTotal(t)
  }

  const setWorkPreset = (p: TimerPreset) => {
    setWorkPresetState(p)
    if (mode === 'work') {
      setRunning(false)
      setFinished(false)
      setSeconds(p.seconds)
      setTotal(p.seconds)
    }
  }

  const setBreakPreset = (p: TimerPreset) => {
    setBreakPresetState(p)
    if (mode === 'break') {
      setRunning(false)
      setFinished(false)
      setSeconds(p.seconds)
      setTotal(p.seconds)
    }
  }

  const switchMode = (m: TimerMode) => {
    setMode(m)
    setRunning(false)
    setFinished(false)
    const t = m === 'work' ? workPreset.seconds : breakPreset.seconds
    setSeconds(t)
    setTotal(t)
  }

  const toggleAutoSwitch = () => {
    setAutoSwitchState((v) => {
      const next = !v
      localStorage.setItem('timer-autoswitch', String(next))
      return next
    })
  }

  return (
    <TimerContext.Provider value={{
      mode, running, seconds, total, finished,
      autoSwitch, toggleAutoSwitch,
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
