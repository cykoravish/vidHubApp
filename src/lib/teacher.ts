import type { Teacher } from '../types/teacher.types'

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function initials(name = ''): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'T'
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function schoolName(t: Teacher | null): string {
  return t && typeof t.schId === 'object' && t.schId.schName ? t.schId.schName : 'Your School'
}

export interface ClassSection {
  classId: string
  className: string
  sectionId: string
  sectionName: string
  label: string
}

/** Class-sections this teacher is the class teacher of (from the login response). */
export function classSections(t: Teacher | null): ClassSection[] {
  const out: ClassSection[] = []
  for (const c of t?.classTeacherOf ?? []) {
    if (!c || typeof c.classID !== 'object' || typeof c.sectionID !== 'object') continue
    out.push({
      classId: c.classID._id,
      className: c.classID.className,
      sectionId: c.sectionID._id,
      sectionName: c.sectionID.sectionName,
      label: `Class ${c.classID.className} - ${c.sectionID.sectionName}`,
    })
  }
  return out
}

export function sessionId(t: Teacher | null): string {
  const s = t?.session
  return typeof s === 'string' ? s : (s?._id ?? '')
}

/** Today as YYYY-MM-DD in the device's local time. */
export function todayISO(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function shiftDay(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
