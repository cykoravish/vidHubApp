import { LogOut, Mail, Phone, School } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { classSections, initials, schoolName } from '../lib/teacher'

export default function ProfilePage() {
  const { teacher, logout } = useAuth()
  const sections = classSections(teacher)
  const rows = [
    { icon: Mail, label: 'Email', value: teacher?.email },
    { icon: Phone, label: 'Phone', value: teacher?.phone },
    { icon: School, label: 'School', value: schoolName(teacher) },
  ].filter((r) => r.value)

  return (
    <div className="pb-6">
      <header className="bg-gradient-to-br from-navy via-brand-900 to-brand-700 px-5 pb-14 pt-[max(2rem,env(safe-area-inset-top))] text-center text-white">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-2xl font-bold ring-1 ring-white/30">
          {initials(teacher?.name)}
        </div>
        <h1 className="mt-3 text-xl font-bold">{teacher?.name}</h1>
        <p className="text-xs capitalize text-brand-200">Teacher · {teacher?.status}</p>
      </header>

      <section className="-mt-8 space-y-4 px-5">
        <div className="divide-y divide-slate-100 rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-ink-soft">{label}</p>
                <p className="truncate text-sm font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {sections.length > 0 && (
          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs text-ink-soft">Class teacher of</p>
            <p className="mt-1 text-sm font-semibold">{sections.map((s) => s.label).join(', ')}</p>
          </div>
        )}

        <button
          onClick={logout}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3.5 text-sm font-semibold text-red-600 transition active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </section>
    </div>
  )
}
