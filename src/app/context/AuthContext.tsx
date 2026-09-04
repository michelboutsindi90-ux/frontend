import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { SafeUser } from '../types'
import * as authClient from '../lib/authClient'
import { getAccessToken, clearTokens } from '../lib/authStorage'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: SafeUser | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  register: (payload: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('idle')

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      if (!getAccessToken()) {
        setStatus('unauthenticated')
        return
      }
      setStatus('loading')
      try {
        const me = await authClient.fetchCurrentUser()
        if (cancelled) return
        if (me) {
          setUser(me)
          setStatus('authenticated')
        } else {
          clearTokens()
          setStatus('unauthenticated')
        }
      } catch {
        if (!cancelled) {
          clearTokens()
          setStatus('unauthenticated')
        }
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const me = await authClient.login(email, password)
    setUser(me)
    setStatus('authenticated')
  }, [])

  const register = useCallback(
    async (payload: { email: string; password: string; fullName: string; phone?: string }) => {
      const me = await authClient.register(payload)
      setUser(me)
      setStatus('authenticated')
    },
    []
  )

  const logout = useCallback(async () => {
    await authClient.logout()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
