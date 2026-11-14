import { ClipboardCheck } from 'lucide-react'

// Placeholder: the real attendance screen is built in the next step.
export default function AttendancePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-brand-700">
        <ClipboardCheck className="h-8 w-8" />
      </span>
      <h1 className="text-lg font-bold">Attendance</h1>
      <p className="text-sm text-ink-soft">This screen is coming up next.</p>
    </div>
  )
}
