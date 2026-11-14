import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  History,
  Info,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { attendanceService } from '../services/attendance.service'
import { ApiError } from '../lib/api'
import { classSections, formatDay, initials, sessionId, shiftDay, todayISO } from '../lib/teacher'
import type { AttendanceStatus, ClassStudent } from '../types/attendance.types'

const STATUSES: { id: AttendanceStatus; short: string; label: string; on: string }[] = [
  { id: 'present', short: 'P', label: 'Present', on: 'bg-emerald-500 text-white border-emerald-500' },
  { id: 'absent', short: 'A', label: 'Absent', on: 'bg-red-500 text-white border-red-500' },
  { id: 'late', short: 'L', label: 'Late', on: 'bg-amber-500 text-white border-amber-500' },
  { id: 'leave', short: 'Lv', label: 'Leave', on: 'bg-sky-500 text-white border-sky-500' },
]

type Marks = Record<string, AttendanceStatus>

const nameOf = (s: ClassStudent) => s.studentId?.regno?.sname?.trim() || 'Unnamed student'
const idOf = (ref: string | { _id: string } | null) => (typeof ref === 'string' ? ref : (ref?._id ?? ''))

function Avatar({ student }: { student: ClassStudent }) {
  const [broken, setBroken] = useState(false)
  const src = student.studentId?.regno?.Image
  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
      />
    )
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
      {initials(nameOf(student))}
    </span>
  )
}

export default function AttendancePage() {
  const { teacher } = useAuth()
  const section = classSections(teacher)[0]
  const session = sessionId(teacher)
  const teacherId = teacher?._id
  const classId = section?.classId
  const sectionId = section?.sectionId
  const today = todayISO()

  const [date, setDate] = useState(today)
  const [students, setStudents] = useState<ClassStudent[] | null>(null)
  const [marks, setMarks] = useState<Marks>({})
  const [saved, setSaved] = useState<Marks | null>(null) // what the server currently has (null = nothing marked yet)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reason, setReason] = useState('')
  const [query, setQuery] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const isPast = date < today

  // 1. Class roster (active students only, by roll number).
  useEffect(() => {
    if (!teacherId || !classId) return
    let cancelled = false
    attendanceService
      .getClassStudents(teacherId)
      .then((res) => {
        if (cancelled) return
        const list = (res.data ?? [])
          .filter((s) => !s.status || s.status === 'active')
          .sort((a, b) => (a.rollNo ?? 1e9) - (b.rollNo ?? 1e9) || nameOf(a).localeCompare(nameOf(b)))
        setStudents(list)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Could not load students.')
      })
    return () => {
      cancelled = true
    }
  }, [teacherId, classId, reloadKey])

  // 2. Attendance already saved for the chosen date (everyone defaults to present).
  useEffect(() => {
    if (!students || !classId || !sectionId) return
    let cancelled = false
    const base: Marks = Object.fromEntries(students.map((s) => [s._id, 'present' as AttendanceStatus]))
    attendanceService
      .getAttendance({ session, class: classId, section: sectionId, date })
      .then((res) => {
        if (cancelled) return
        const records = res.data ?? []
        if (records.length === 0) {
          setMarks(base)
          setSaved(null)
          return
        }
        const merged = { ...base }
        for (const r of records) {
          const id = idOf(r.student)
          if (id in merged) merged[id] = r.status
        }
        setMarks(merged)
        setSaved(merged)
      })
      .catch(() => {
        if (cancelled) return
        setMarks(base)
        setSaved(null)
      })
    return () => {
      cancelled = true
    }
  }, [students, session, classId, sectionId, date])

  const counts = useMemo(() => {
    const c: Record<AttendanceStatus, number> = { present: 0, absent: 0, late: 0, leave: 0 }
    for (const s of students ?? []) c[marks[s._id] ?? 'present'] += 1
    return c
  }, [students, marks])

  const total = students?.length ?? 0
  const dirty = saved === null || JSON.stringify(saved) !== JSON.stringify(marks)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students ?? []
    return (students ?? []).filter((s) => nameOf(s).toLowerCase().includes(q) || String(s.rollNo ?? '').includes(q))
  }, [students, query])

  const changeDate = useCallback((value: string) => {
    if (!value || value > todayISO()) return
    setDate(value)
    setReason('')
    setSaveError(null)
    setJustSaved(false)
  }, [])

  function setMark(id: string, status: AttendanceStatus) {
    setMarks((m) => ({ ...m, [id]: status }))
    setJustSaved(false)
    setSaveError(null)
  }

  function markAllPresent() {
    setMarks(Object.fromEntries((students ?? []).map((s) => [s._id, 'present' as AttendanceStatus])))
    setJustSaved(false)
  }

  async function save() {
    if (!teacher || !section || !students || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      await attendanceService.mark({
        session,
        class: section.classId,
        section: section.sectionId,
        date,
        teacherId: teacher._id,
        records: students.map((s) => ({ student: s._id, status: marks[s._id] ?? 'present' })),
        ...(isPast && reason.trim() ? { reason: reason.trim() } : {}),
      })
      setSaved({ ...marks })
      setJustSaved(true)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save attendance. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  /* ---------- Empty / error states ---------- */
  if (!section) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-600">
          <Info className="h-8 w-8" />
        </span>
        <h1 className="text-lg font-bold">No class assigned</h1>
        <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
          Only class teachers can mark attendance. If you were assigned recently, sign out and sign in again.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-navy via-brand-900 to-brand-700 px-5 pb-14 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Attendance</h1>
            <p className="text-xs text-brand-200">{section.label}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              saved ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/15 text-brand-100'
            }`}
          >
            {saved ? 'Saved' : 'Not marked'}
          </span>
        </div>

        {/* Date switcher */}
        <div className="relative mt-4 flex items-center gap-2">
          <button
            onClick={() => changeDate(shiftDay(date, -1))}
            aria-label="Previous day"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 transition active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="relative flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/15 text-sm font-semibold">
            <CalendarDays className="h-4 w-4" />
            {formatDay(date)}
            {date === today && <span className="rounded-full bg-white/20 px-2 text-[10px]">Today</span>}
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => changeDate(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              aria-label="Choose date"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <button
            onClick={() => changeDate(shiftDay(date, 1))}
            disabled={date >= today}
            aria-label="Next day"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 transition active:scale-95 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Summary */}
      <section className="relative -mt-8 px-5">
        <div className="rounded-3xl bg-white p-4 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-100">
          <div className="grid grid-cols-4 gap-2 text-center">
            {STATUSES.map((s) => (
              <div key={s.id}>
                <p className="text-xl font-bold leading-none">{counts[s.id]}</p>
                <p className="mt-1 text-[11px] text-ink-soft">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
            {total > 0 && (
              <>
                <div className="bg-emerald-500" style={{ width: `${(counts.present / total) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(counts.late / total) * 100}%` }} />
                <div className="bg-sky-500" style={{ width: `${(counts.leave / total) * 100}%` }} />
                <div className="bg-red-500" style={{ width: `${(counts.absent / total) * 100}%` }} />
              </>
            )}
          </div>
        </div>
      </section>

      {isPast && (
        <section className="mt-4 px-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <History className="h-4 w-4" /> Editing a past date
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              Any change will be recorded in the attendance log.
            </p>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={300}
              placeholder="Reason for change (optional)"
              className="mt-2.5 h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none placeholder:text-amber-400 focus:border-amber-400"
            />
          </div>
        </section>
      )}

      {/* Roster */}
      <section className="mt-4 flex-1 px-5 pb-4">
        {loadError ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm font-semibold">{loadError}</p>
            <button
              onClick={() => {
                setLoadError(null)
                setStudents(null)
                setReloadKey((k) => k + 1)
              }}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        ) : students === null ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                <div className="h-11 w-11 rounded-full bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold">No students found</p>
            <p className="mt-1 text-sm text-ink-soft">There are no active students in {section.label}.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex h-11 flex-1 items-center gap-2 rounded-2xl bg-white px-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-600/40">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or roll no."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={markAllPresent}
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition active:scale-95"
              >
                <CheckCheck className="h-4 w-4" /> All present
              </button>
            </div>

            <p className="mb-2 mt-3 text-[11px] text-ink-soft">
              P Present · A Absent · L Late · Lv Leave
            </p>

            <ul className="space-y-2.5">
              {visible.map((s) => {
                const current = marks[s._id] ?? 'present'
                return (
                  <li key={s._id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                    <Avatar student={s} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{nameOf(s)}</p>
                      <p className="text-xs text-ink-soft">Roll {s.rollNo ?? '-'}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5" role="group" aria-label={`Attendance for ${nameOf(s)}`}>
                      {STATUSES.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setMark(s._id, st.id)}
                          aria-pressed={current === st.id}
                          aria-label={st.label}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition active:scale-90 ${
                            current === st.id ? st.on : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          {st.short}
                        </button>
                      ))}
                    </div>
                  </li>
                )
              })}
              {visible.length === 0 && <li className="py-6 text-center text-sm text-ink-soft">No matching students</li>}
            </ul>
          </>
        )}
      </section>

      {/* Sticky save bar */}
      {students && students.length > 0 && (
        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          {saveError && (
            <p role="alert" className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {saveError}
            </p>
          )}
          <button
            onClick={save}
            disabled={saving || (!dirty && !justSaved)}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed ${
              justSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-brand-700 to-brand-900 text-white shadow-lg shadow-brand-800/25 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Saving…
              </>
            ) : justSaved ? (
              <>
                <Check className="h-5 w-5" /> Attendance saved
              </>
            ) : dirty ? (
              `Save attendance · ${counts.present} present, ${total - counts.present} not present`
            ) : (
              'No changes to save'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
