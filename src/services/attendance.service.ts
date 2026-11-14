import { api } from '../lib/api'
import type {
  ClassStudentsResponse,
  GetAttendanceResponse,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
} from '../types/attendance.types'

export const attendanceService = {
  getClassStudents(teacherId: string) {
    return api<ClassStudentsResponse>(`/api/teachers/class-student-list?id=${encodeURIComponent(teacherId)}`)
  },
  getAttendance(params: { session: string; class: string; section: string; date: string }) {
    return api<GetAttendanceResponse>(`/api/attendance?${new URLSearchParams(params).toString()}`)
  },
  mark(payload: MarkAttendanceRequest) {
    return api<MarkAttendanceResponse>('/api/attendance/mark', { method: 'POST', body: payload })
  },
}
