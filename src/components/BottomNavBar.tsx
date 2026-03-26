import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Notes', icon: 'sticky_note_2', path: '/board' },
  { label: 'Focus', icon: 'timer', path: '/focus' },
  { label: 'Tasks', icon: 'check_circle', path: '/tasks' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
]

export default function BottomNavBar() {
  const location = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 rounded-t-2xl"
      style={{
        background: '#fffcf7',
        boxShadow: '0px -4px 20px rgba(56,56,53,0.06)',
      }}
    >
      {NAV_ITEMS.map(({ label, icon, path }) => {
        const active = location.pathname === path
        return (
          <Link
            key={label}
            to={path}
            className="flex flex-col items-center justify-center px-5 py-2 rounded-xl transition-transform active:scale-90 duration-200"
            style={{
              background: active ? '#ffc650' : 'transparent',
              color: active ? '#383835' : '#656461',
            }}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span
              className="text-[11px] font-medium uppercase tracking-wider mt-1"
              style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
