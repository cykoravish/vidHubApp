export interface ClassTeacherOf {
  classID?: { _id: string; className: string; classInWord?: string } | string
  sectionID?: { _id: string; sectionName: string } | string
}

export interface Teacher {
  _id: string
  name: string
  email: string
  phone?: string
  status: string
  schId: { _id: string; schName?: string; schoolCode?: string } | string
  session?: { _id: string; sessionName?: string } | string
  assignedClasses?: unknown[]
  classTeacherOf?: ClassTeacherOf[]
}

export interface TeacherLoginResponse {
  success: boolean
  message: string
  data: { accessToken: string; teacher: Teacher }
}
