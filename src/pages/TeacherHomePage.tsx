import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Placeholder: the real home (header + action grid + bottom nav) comes in the next step.
export default function TeacherHomePage() {
  const { teacher, logout } = useAuth()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Hello, {teacher?.name} 👋</h1>
      <p className="text-ink-soft">You are signed in. The home screen is coming in the next step.</p>
      <button
        onClick={logout}
        className="flex h-12 items-center gap-2 rounded-2xl bg-brand-600 px-6 font-semibold text-white"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  )
}
