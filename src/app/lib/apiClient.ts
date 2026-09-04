import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './authStorage'

// In dev, VITE_API_BASE_URL is usually left unset so this derives the API host
// from whatever host the page itself was loaded from — this is what makes the
// app reachable from a phone on the same network (http://<lan-ip>:3000), since
// a hardcoded "localhost" would point the phone at itself instead of the dev
// machine. Set VITE_API_BASE_URL explicitly only for a real deployment where
// the frontend and backend live on different domains.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  skipAuthRetry?: boolean
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!res.ok) return false
        const data = await res.json()
        setTokens(data.accessToken, data.refreshToken)
        return true
      } catch {
        return false
      } finally {
        refreshInFlight = null
      }
    })()
  }
  return refreshInFlight
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (typeof data?.message === 'string') return data.message
  } catch {
    // response had no JSON body
  }
  return `Erreur ${res.status}`
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuthRetry = false } = options

  const doFetch = () => {
    const token = getAccessToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let res = await doFetch()

  if (res.status === 401 && !skipAuthRetry) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      res = await doFetch()
    } else {
      clearTokens()
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function apiRequestBlob(path: string): Promise<Blob> {
  const token = getAccessToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  let res = await fetch(`${BASE_URL}${path}`, { headers })

  if (res.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const retryToken = getAccessToken()
      res = await fetch(`${BASE_URL}${path}`, {
        headers: retryToken ? { Authorization: `Bearer ${retryToken}` } : {},
      })
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }
  return res.blob()
}
