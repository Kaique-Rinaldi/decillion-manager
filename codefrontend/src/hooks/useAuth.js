import { useState, useEffect } from 'react'
import { ADMIN_CREDENTIALS } from '../data/mockData'

const AUTH_KEY = 'dcl_auth'

// ─── useAuth ──────────────────────────────────────────────────────────────────
// Gerencia autenticação com persistência em localStorage.
// Em um sistema real, substituir por chamadas JWT/API.
export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function login(email, password) {
    setLoading(true)
    setError('')

    // Simula latência de API (remove ao integrar backend real)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (
          email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
          password === ADMIN_CREDENTIALS.password
        ) {
          const userData = {
            email: ADMIN_CREDENTIALS.email,
            name: 'Admin',
            role: 'admin',
            loginAt: new Date().toISOString(),
          }
          localStorage.setItem(AUTH_KEY, JSON.stringify(userData))
          setUser(userData)
          setLoading(false)
          resolve({ ok: true })
        } else {
          setError('Email ou senha incorretos.')
          setLoading(false)
          resolve({ ok: false })
        }
      }, 600)
    })
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }

  return { user, loading, error, login, logout, setError }
}