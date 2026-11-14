import { api } from '../lib/api'
import type { TeacherLoginResponse } from '../types/teacher.types'

export const teacherService = {
  login(email: string, password: string) {
    return api<TeacherLoginResponse>('/api/teachers/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    })
  },
}
