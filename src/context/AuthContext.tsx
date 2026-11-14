import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Teacher } from '../types/teacher.types'
import { clearSession, getStoredTeacher, getToken, isTokenExpired, saveSession } from '../lib/tokenStorage'

interface AuthValue {
  teacher: Teacher | null
  isAuthenticated: boolean
  login: (token: string, teacher: Teacher) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | undefined>(undefined)

function readInitial(): Teacher | null {
  const token = getToken()
  if (!token || isTokenExpired(token)) {
    clearSession()
    return null
  }
  return getStoredTeacher<Teacher>()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(readInitial)

  const login = useCallback((token: string, t: Teacher) => {
    saveSession(token, t)
    setTeacher(t)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setTeacher(null)
  }, [])

  // Any 401 from the API logs the teacher out.
  useEffect(() => {
    window.addEventListener('vh:unauthorized', logout)
    return () => window.removeEventListener('vh:unauthorized', logout)
  }, [logout])

  const value = useMemo(() => ({ teacher, isAuthenticated: Boolean(teacher), login, logout }), [teacher, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
