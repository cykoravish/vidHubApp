import { env } from '../config/env'
import { getToken } from './tokenStorage'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

export async function api<T>(path: string, { method = 'GET', body, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 20_000)
  let res: Response
  try {
    res = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    throw new ApiError('Unable to reach the server. Please check your internet connection and try again.', 0)
  } finally {
    window.clearTimeout(timer)
  }

  const payload = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && auth) window.dispatchEvent(new Event('vh:unauthorized'))
    throw new ApiError(payload?.message || `Request failed (${res.status})`, res.status)
  }
  return payload as T
}
