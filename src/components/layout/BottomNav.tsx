import { NavLink } from 'react-router-dom'
import { ClipboardCheck, Home, UserRound } from 'lucide-react'

const ITEMS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="shrink-0 border-t border-slate-200 bg-white/95 px-3 pt-2 backdrop-blur pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <ul className="grid grid-cols-3">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition ${
                  isActive ? 'text-brand-700' : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-14 items-center justify-center rounded-full transition ${
                      isActive ? 'bg-brand-100' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
