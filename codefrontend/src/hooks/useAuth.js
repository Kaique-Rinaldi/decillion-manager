import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError('')
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const msg = err.message || 'Erro ao fazer login.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email, password) => {
    setLoading(true)
    setError('')
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) throw err
      return { success: true, user: data.user, needsConfirmation: !data.session }
    } catch (err) {
      const msg = err.message || 'Erro ao criar conta.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
  }, [])

  return { user, loading, error, login, register, logout, setError }
}