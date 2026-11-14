export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave'

export interface ClassStudent {
  _id: string // StudentEnrollment id (this is what attendance records use)
  rollNo?: number
  status?: string
  studentId?: {
    admno?: string
    regno?: { sname?: string; Image?: string; gender?: string }
  }
}

export interface ClassStudentsResponse {
  success: boolean
  data: ClassStudent[]
}

export interface SavedAttendanceRecord {
  _id: string
  student: string | { _id: string } | null
  status: AttendanceStatus
  remark?: string
}

export interface GetAttendanceResponse {
  success: boolean
  data: SavedAttendanceRecord[]
}

export interface MarkAttendanceRequest {
  session: string
  class: string
  section: string
  date: string // YYYY-MM-DD
  teacherId: string
  records: { student: string; status: AttendanceStatus }[]
  reason?: string
}

export interface MarkAttendanceResponse {
  success: boolean
  data: { date: string; total: number; logged: number }
}
