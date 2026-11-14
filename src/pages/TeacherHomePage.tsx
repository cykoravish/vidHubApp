import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FilePenLine,
  Info,
  Megaphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { classSections, greeting, initials, schoolName } from '../lib/teacher'

interface Action {
  label: string
  icon: LucideIcon
  to?: string
  tone: string
}

const ACTIONS: Action[] = [
  { label: 'Attendance', icon: ClipboardCheck, to: '/attendance', tone: 'bg-brand-100 text-brand-700' },
  { label: 'Mark Entry', icon: FilePenLine, tone: 'bg-emerald-100 text-emerald-700' },
  { label: 'Payroll', icon: Wallet, tone: 'bg-amber-100 text-amber-700' },
  { label: 'Timetable', icon: CalendarDays, tone: 'bg-violet-100 text-violet-700' },
  { label: 'Homework', icon: BookOpen, tone: 'bg-sky-100 text-sky-700' },
  { label: 'Notices', icon: Megaphone, tone: 'bg-rose-100 text-rose-700' },
]

export default function TeacherHomePage() {
  const { teacher } = useAuth()
  const sections = classSections(teacher)
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-navy via-brand-900 to-brand-700 px-5 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative flex items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/30 backdrop-blur">
            {initials(teacher?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-brand-200">{greeting()}</p>
            <h1 className="truncate text-xl font-bold leading-tight">{teacher?.name}</h1>
            <p className="truncate text-xs text-brand-100/80">{schoolName(teacher)}</p>
          </div>
        </div>
        <p className="relative mt-5 text-xs font-medium text-brand-100/80">{today}</p>
      </header>

      {/* Today card */}
      <section className="relative -mt-10 px-5">
        {sections.length > 0 ? (
          <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Class teacher of</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sections.map((s) => (
                <span
                  key={`${s.classId}-${s.sectionId}`}
                  className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-800"
                >
                  {s.label}
                </span>
              ))}
            </div>
            <Link
              to="/attendance"
              className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-900 text-sm font-semibold text-white shadow-lg shadow-brand-800/25 transition active:scale-[0.98]"
            >
              Mark today&apos;s attendance <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 rounded-3xl bg-white p-5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-100">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold">No class assigned yet</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                You need to be a class teacher to mark attendance. Please contact your school administrator.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-7 px-5">
        <h2 className="text-base font-bold">Quick actions</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {ACTIONS.map(({ label, icon: Icon, to, tone }) => {
            const body = (
              <>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold text-ink">{label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    to ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {to ? 'Live' : 'Soon'}
                </span>
              </>
            )
            const base =
              'flex flex-col items-center gap-2 rounded-3xl bg-white px-2 py-4 text-center shadow-sm ring-1 ring-slate-100'
            return to ? (
              <Link key={label} to={to} className={`${base} transition active:scale-95`}>
                {body}
              </Link>
            ) : (
              <div key={label} aria-disabled="true" className={`${base} opacity-70`}>
                {body}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
