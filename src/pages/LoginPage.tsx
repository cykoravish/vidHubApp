import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { teacherService } from '../services/teacher.service'
import { ApiError } from '../lib/api'

type Role = 'teacher' | 'student'

const ROLES: { id: Role; label: string; icon: typeof Users }[] = [
  { id: 'teacher', label: 'Teacher', icon: Users },
  { id: 'student', label: 'Student', icon: UserRound },
]

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('teacher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to="/home" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await teacherService.login(email.trim(), password)
      login(res.data.accessToken, res.data.teacher)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const field =
    'group flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-600/10'

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-100 via-brand-50 to-slate-200 md:flex md:items-center md:justify-center md:p-8">
      <div className="flex min-h-dvh w-full flex-col bg-white md:min-h-[740px] md:max-w-[430px] md:overflow-hidden md:rounded-[2.25rem] md:shadow-[0_30px_80px_-20px_rgba(30,58,138,0.35)] md:ring-1 md:ring-slate-200">
        {/* Hero */}
        <header className="relative overflow-hidden bg-gradient-to-br from-navy via-brand-900 to-brand-700 px-7 pb-20 pt-[max(2.25rem,env(safe-area-inset-top))] text-white">
          <div className="dot-grid pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/20">
              <GraduationCap className="h-7 w-7 text-brand-800" />
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-accent" />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-none tracking-tight">VidyaHub</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-200">
                School Portal
              </p>
            </div>
          </div>

          <h1 className="relative mt-9 text-[1.75rem] font-bold leading-tight tracking-tight">
            Welcome back
          </h1>
          <p className="relative mt-1.5 max-w-[17rem] text-sm leading-relaxed text-brand-100/90">
            Sign in to manage attendance and stay connected with your school.
          </p>
        </header>

        {/* Sheet */}
        <main className="relative -mt-10 flex flex-1 flex-col rounded-t-[2rem] bg-white px-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-7 shadow-[0_-12px_30px_-12px_rgba(15,23,42,0.25)]">
          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="Sign in as">
            {ROLES.map(({ id, label, icon: Icon }) => {
              const active = role === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setRole(id)
                    setError(null)
                  }}
                  className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                    active ? 'bg-white text-brand-800 shadow-sm ring-1 ring-slate-200' : 'text-ink-soft'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              )
            })}
          </div>

          {role === 'student' ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700 ring-8 ring-brand-50/60">
                <BookOpenCheck className="h-9 w-9" />
              </div>
              <span className="mt-6 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Coming soon
              </span>
              <h2 className="mt-3 text-lg font-bold">Student portal is on its way</h2>
              <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-ink-soft">
                Student sign in is not available yet. Please check back soon.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-7 flex flex-1 flex-col" noValidate>
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-ink">Email address</span>
                  <div className={field}>
                    <Mail className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-brand-600" />
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="username"
                      autoCapitalize="none"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@school.com"
                      className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-ink">Password</span>
                  <div className={field}>
                    <Lock className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-brand-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:text-brand-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-900 text-[15px] font-semibold text-white shadow-lg shadow-brand-800/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="mt-5 text-center text-[13px] text-ink-soft">
                Trouble signing in? Contact your school administrator.
              </p>
            </form>
          )}

          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure sign in · © {new Date().getFullYear()} VidyaHub
          </div>
        </main>
      </div>
    </div>
  )
}
