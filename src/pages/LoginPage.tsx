import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, School, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { teacherService } from '../services/teacher.service'
import { ApiError } from '../lib/api'

type Role = 'teacher' | 'student'

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
      setError(err instanceof ApiError ? err.message : 'Kuch galat ho gaya. Dobara try karein.')
    } finally {
      setLoading(false)
    }
  }

  const inputWrap =
    'flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 h-14 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/15 transition'

  return (
    <div className="flex min-h-dvh flex-col bg-brand-700">
      {/* Hero */}
      <header className="pt-safe relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 px-6 pb-16 pt-10 text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold leading-none tracking-tight">VidyaHub</h1>
            <p className="mt-1 text-xs font-medium text-white/80">Teacher & Student Portal</p>
          </div>
        </div>
        <h2 className="relative mt-8 text-3xl font-bold leading-tight">
          Welcome back <span aria-hidden>👋</span>
        </h2>
        <p className="relative mt-1 text-sm text-white/80">Apne account me login karein</p>
      </header>

      {/* Sheet */}
      <main className="pb-safe -mt-8 flex flex-1 flex-col rounded-t-[2rem] bg-white px-6 pb-8 pt-6 shadow-2xl">
        {/* Role toggle */}
        <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="Login as">
          {(['teacher', 'student'] as const).map((r) => {
            const active = role === r
            const Icon = r === 'teacher' ? School : UserRound
            return (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setRole(r)
                  setError(null)
                }}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                  active ? 'bg-white text-brand-700 shadow' : 'text-ink-soft'
                }`}
              >
                <Icon className="h-4 w-4" />
                {r === 'teacher' ? 'Teacher' : 'Student'}
              </button>
            )
          })}
        </div>

        {role === 'student' ? (
          <div className="mt-10 flex flex-1 flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
              <UserRound className="h-10 w-10" />
            </div>
            <h3 className="mt-5 text-lg font-bold">Student login jaldi aa raha hai</h3>
            <p className="mt-2 max-w-xs text-sm text-ink-soft">
              Abhi sirf teachers login kar sakte hain. Students ke liye feature bahut jald shuru hoga.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col gap-4" noValidate>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Email</span>
              <div className={inputWrap}>
                <Mail className="h-5 w-5 shrink-0 text-ink-soft" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.com"
                  className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Password</span>
              <div className={inputWrap}>
                <Lock className="h-5 w-5 shrink-0 text-ink-soft" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink-soft"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-2 flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {loading ? 'Login ho raha hai…' : 'Login'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} VidyaHub</p>
      </main>
    </div>
  )
}
