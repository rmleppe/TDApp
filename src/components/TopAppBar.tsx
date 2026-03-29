import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import {
  useTimer,
  WORK_PRESETS,
  BREAK_PRESETS,
  type TimerMode,
  type TimerPreset,
} from '../context/TimerContext'
import { useAuth } from '../context/AuthContext'

/* ── helpers ──────────────────────────────────────────────────────── */
const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

const COLORS: Record<TimerMode, { accent: string; bg: string; pill: string; text: string }> = {
  work:  { accent: '#007257', bg: 'rgba(137,240,203,0.18)', pill: '#89f0cb', text: '#00382a' },
  break: { accent: '#6b5ea8', bg: 'rgba(230,230,250,0.18)', pill: '#e6e6fa', text: '#22005d' },
}

/* ── Timer pill (always visible in header) ────────────────────────── */
const SOLID_BG: Record<TimerMode, string> = {
  work:  '#edfaf4',
  break: '#f4f4fd',
}

function TimerPill({ onTogglePanel }: { onTogglePanel: () => void }) {
  const { mode, running, seconds, total, play, pause, reset, focusMode, toggleFocusMode } = useTimer()
  const c = COLORS[mode]
  const pct       = total > 0 ? seconds / total : 1
  const isWarning = pct < 0.15 && running
  const isEmpty   = seconds === 0

  const glowColor = isWarning ? '#be2d0640' : `${c.accent}30`
  const glowHover = isWarning ? '#be2d0666' : `${c.accent}55`
  const pillBg    = focusMode ? SOLID_BG[mode] : c.bg

  return (
    <div
      className="relative flex items-center gap-1.5 md:gap-3 px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl overflow-hidden select-none"
      style={{
        background: pillBg,
        boxShadow: `0 0 0 0px ${glowColor}`,
        transition: 'box-shadow 0.25s ease',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 0 18px 4px ${glowHover}`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 0 0 0px ${glowColor}`
      }}
    >
      {/* Background fill — drains left-to-right as time passes */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: isWarning ? '#f95630' : c.pill,
          opacity: isWarning ? 0.25 : 0.4,
          transform: `scaleX(${pct})`,
          transformOrigin: 'left center',
          transition: 'transform 0.9s linear, background 0.5s ease, opacity 0.5s ease',
        }}
      />

      {/* Mode icon — spins once when switching mode */}
      <span
        className="material-symbols-outlined text-[14px] md:text-[18px] relative z-10 flex-shrink-0 transition-transform duration-300"
        style={{
          color: isWarning ? '#be2d06' : c.accent,
          transform: running ? 'rotate(0deg)' : 'rotate(0deg)',
        }}
      >
        {isEmpty ? 'check_circle' : mode === 'work' ? 'timer' : 'coffee'}
      </span>

      {/* Time — key trick triggers tick-pop CSS animation each second */}
      <button
        onClick={onTogglePanel}
        className="relative z-10 flex-shrink-0 cursor-pointer"
        title="Configurar timer"
      >
        <span
          className={[
            'font-bold tabular-nums text-sm md:text-base inline-block',
            isWarning ? 'timer-warning' : '',
          ].join(' ')}
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            color: isWarning ? '#be2d06' : c.accent,
          }}
        >
          {fmt(seconds)}
        </span>
      </button>

      {/* Divider */}
      <div
        className="w-px h-4 relative z-10 flex-shrink-0 transition-colors duration-300"
        style={{ background: isWarning ? '#be2d06' : c.accent, opacity: 0.2 }}
      />

      {/* Controls */}
      <div className="flex gap-0.5 relative z-10">
        <button
          onClick={running ? pause : play}
          className="p-1 rounded-lg transition-all duration-150 active:scale-75 hover:scale-110 cursor-pointer"
          style={{ color: isWarning ? '#be2d06' : c.accent }}
          title={running ? 'Pausar' : 'Iniciar'}
        >
          <span className="material-symbols-outlined text-[16px] md:text-[20px]">
            {running ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <button
          onClick={reset}
          className="p-1 rounded-lg transition-all duration-150 active:scale-75 hover:scale-110 hover:rotate-[-30deg] cursor-pointer"
          style={{ color: isWarning ? '#be2d06' : c.accent }}
          title="Reiniciar"
        >
          <span className="material-symbols-outlined text-[16px] md:text-[20px]">restart_alt</span>
        </button>
      </div>

      {/* Divider */}
      <div
        className="w-px h-4 relative z-10 flex-shrink-0 transition-colors duration-300"
        style={{ background: isWarning ? '#be2d06' : c.accent, opacity: 0.2 }}
      />

      {/* Focus toggle */}
      <button
        onClick={toggleFocusMode}
        className="p-1 rounded-lg transition-all duration-150 active:scale-75 hover:scale-110 relative z-10 flex-shrink-0 cursor-pointer"
        style={{ color: focusMode ? c.accent : isWarning ? '#be2d06' : c.accent, opacity: focusMode ? 1 : 0.5 }}
        title={focusMode ? 'Salir de foco' : 'Modo foco'}
      >
        <span className="material-symbols-outlined text-[16px] md:text-[20px]">
          {focusMode ? 'lens_blur' : 'center_focus_strong'}
        </span>
      </button>
    </div>
  )
}

/* ── Preset chip ─────────────────────────────────────────────────── */
function PresetChip({
  preset,
  active,
  color,
  onClick,
}: {
  preset: TimerPreset
  active: boolean
  color: typeof COLORS[TimerMode]
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
      style={{
        background: active ? color.pill : 'rgba(0,0,0,0.05)',
        color: active ? color.text : '#635f5a',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        outline: active ? `2px solid ${color.accent}` : '2px solid transparent',
        outlineOffset: '1px',
      }}
    >
      {preset.label}
    </button>
  )
}

/* ── Dropdown panel ──────────────────────────────────────────────── */
function TimerPanel({ onClose, anchor }: { onClose: () => void; anchor: DOMRect }) {
  const {
    mode, seconds, total, running,
    workPreset, breakPreset,
    setWorkPreset, setBreakPreset,
    switchMode, play, pause, reset,
  } = useTimer()
  const c = COLORS[mode]
  const pct = total > 0 ? seconds / total : 1
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const barW = `${Math.round(pct * 100)}%`
  const centerX = anchor.left + anchor.width / 2
  const top = anchor.bottom + 8

  return (
    <div
      ref={panelRef}
      className="rounded-2xl p-5 w-72 shadow-2xl"
      style={{
        position: 'fixed',
        top,
        left: centerX,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#fefcf4',
        border: '1px solid #e8e5dd',
      }}
    >
      {/* Mode tabs */}
      <div className="flex gap-2 mb-5">
        {(['work', 'break'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className="flex-1 py-2 rounded-xl font-bold text-sm transition-all"
            style={{
              background: mode === m ? COLORS[m].pill : '#eeece4',
              color: mode === m ? COLORS[m].text : '#635f5a',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {m === 'work' ? '🍅 Trabajo' : '☕ Descanso'}
          </button>
        ))}
      </div>

      {/* Big time display */}
      <div className="text-center mb-4">
        <p
          className="text-5xl font-black tabular-nums tracking-tight"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: c.accent }}
        >
          {fmt(seconds)}
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: barW,
              background: c.accent,
              transition: 'width 0.9s linear',
            }}
          />
        </div>
      </div>

      {/* Presets */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#82807c', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {mode === 'work' ? 'Duración de sesión' : 'Duración de descanso'}
        </p>
        <div className="flex gap-2 flex-wrap">
          {(mode === 'work' ? WORK_PRESETS : BREAK_PRESETS).map((p) => {
            const active = mode === 'work'
              ? workPreset.seconds === p.seconds
              : breakPreset.seconds === p.seconds
            return (
              <PresetChip
                key={p.label}
                preset={p}
                active={active}
                color={c}
                onClick={() => mode === 'work' ? setWorkPreset(p) : setBreakPreset(p)}
              />
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={running ? pause : play}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all active:scale-95"
          style={{ background: c.accent, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <span className="material-symbols-outlined text-[20px]">
            {running ? 'pause' : 'play_arrow'}
          </span>
          {running ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-2.5 rounded-xl transition-all active:scale-95"
          style={{ background: '#eeece4', color: '#635f5a' }}
          title="Reiniciar"
        >
          <span className="material-symbols-outlined text-[20px]">restart_alt</span>
        </button>
      </div>
    </div>
  )
}

/* ── TopAppBar ───────────────────────────────────────────────────── */
export default function TopAppBar() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { focusMode, toggleFocusMode } = useTimer()
  const avatarRef = useRef<HTMLDivElement>(null)
  const pillContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    if (avatarOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen])

  const navLinks = [
    { label: 'Board',   path: '/board'   },
    { label: 'Archive', path: '/archive' },
  ]

  return (
    <>
    <header
      className={`sticky top-0 ${focusMode ? 'z-[60]' : 'z-50 glass'}`}
      style={{ borderBottom: focusMode ? 'none' : '1px solid rgba(200,196,188,0.3)' }}
    >
      <div className="grid grid-cols-3 items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
        {/* Left: Logo + Nav */}
        <div className={`flex items-center gap-8 ${focusMode ? 'invisible' : ''}`}>
          <Link
            to="/board"
            className="text-lg md:text-2xl font-black tracking-tighter"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#007257' }}
          >
            TDApp
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map(({ label, path }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={label}
                  to={path}
                  className="font-bold text-lg tracking-tight transition-colors duration-200 px-2 rounded-t"
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    color: active ? '#007257' : '#635f5a',
                    borderBottom: active ? '2px solid #007257' : '2px solid transparent',
                    paddingBottom: '4px',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Center: Timer */}
        <div className="flex justify-center">
          <div className="relative" ref={pillContainerRef}>
            <TimerPill onTogglePanel={() => setPanelOpen((o) => !o)} />
          </div>
        </div>

        {/* Right: Avatar + dropdown */}
        <div className="flex justify-end items-center gap-2" ref={avatarRef}>
          <div className={`relative ${focusMode ? 'invisible' : ''}`}>
            <button
              onClick={() => setAvatarOpen((o) => !o)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm select-none flex-shrink-0 cursor-pointer overflow-hidden transition-opacity hover:opacity-80"
              style={{ background: '#89f0cb', color: '#00382a', fontFamily: 'Plus Jakarta Sans, sans-serif', border: '2px solid #89f0cb' }}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.displayName?.[0]?.toUpperCase() ?? 'U'
              )}
            </button>

            {avatarOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl p-3 z-[200] shadow-2xl"
                style={{ background: '#fefcf4', border: '1px solid #e8e5dd' }}
              >
                <div className="px-2 py-1.5 mb-2">
                  <p className="text-sm font-bold truncate" style={{ color: '#383833', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {user?.displayName}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#82807c', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                    {user?.email}
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #e8e5dd', marginBottom: '8px' }} />
                <button
                  onClick={() => { setAvatarOpen(false); logout() }}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  style={{ color: '#635f5a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#f0ede5')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {panelOpen && pillContainerRef.current && createPortal(
      <TimerPanel
        onClose={() => setPanelOpen(false)}
        anchor={pillContainerRef.current.getBoundingClientRect()}
      />,
      document.body
    )}
    </>
  )
}
