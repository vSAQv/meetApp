import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AuthContextValue = {
  token: string | null
  setToken: (t: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem('token')
  })

  const setToken = (t: string | null) => {
    setTokenState(t)
    if (!t) localStorage.removeItem('token')
    else localStorage.setItem('token', t)
  }

  const logout = () => setToken(null)

  const value = useMemo(() => ({ token, setToken, logout }), [token])

  // Если вкладки открыты одновременно — синхронизируем токен.
  useEffect(() => {
    const onStorage = () => setTokenState(localStorage.getItem('token'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}

