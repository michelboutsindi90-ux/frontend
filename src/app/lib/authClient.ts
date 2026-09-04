import { apiRequest } from './apiClient'
import { setTokens, clearTokens, getRefreshToken } from './authStorage'
import { SafeUser } from '../types'

interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: SafeUser
}

export async function login(email: string, password: string): Promise<SafeUser> {
  const data = await apiRequest<AuthTokens>('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuthRetry: true,
  })
  setTokens(data.accessToken, data.refreshToken)
  return data.user
}

export async function register(payload: {
  email: string
  password: string
  fullName: string
  phone?: string
}): Promise<SafeUser> {
  const data = await apiRequest<AuthTokens>('/auth/register', {
    method: 'POST',
    body: payload,
    skipAuthRetry: true,
  })
  setTokens(data.accessToken, data.refreshToken)
  return data.user
}

export async function fetchCurrentUser(): Promise<SafeUser | null> {
  return apiRequest<SafeUser | null>('/auth/me', { skipAuthRetry: true })
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
        skipAuthRetry: true,
      })
    }
  } finally {
    clearTokens()
  }
}
