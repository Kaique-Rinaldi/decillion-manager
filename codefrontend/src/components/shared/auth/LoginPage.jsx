import { useState } from 'react'
import { motion } from 'framer-motion'

// ─── LoginPage ────────────────────────────────────────────────────────────────
// Tela de login com email/senha.
// Credencial demo: admin@decillion.com / admin123
export default function LoginPage({ onLogin, loading, error, clearError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errs = {}
    if (!email.trim()) errs.email = 'Informe seu email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido'
    if (!password) errs.password = 'Informe sua senha'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    if (!validate()) return
    await onLogin(email, password)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 20,
    }}>
      {/* Background texture */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(circle at 20% 80%, rgba(26,25,22,.04) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(26,25,22,.06) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <motion.div
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .3, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent)', color: 'var(--accent-fg)',
            fontSize: 22, fontWeight: 700, marginBottom: 16,
            boxShadow: '0 4px 14px rgba(0,0,0,.15)',
          }}>D</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.4px' }}>
            Decillion Manager
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
          padding: '32px', boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
        }}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Global error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: 'var(--red-bg)', color: 'var(--red)',
                  padding: '10px 14px', borderRadius: 'var(--radius)',
                  fontSize: 13, fontWeight: 500, marginBottom: 20,
                  border: '1px solid #fca5a5',
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: ''})) }}
                placeholder="admin@decillion.com"
                className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                disabled={loading}
              />
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" htmlFor="login-password">
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ''})) }}
                  placeholder="••••••••"
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  disabled={loading}
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text3)', padding: 4, fontSize: 13,
                  }}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ height: 44, fontSize: 14, fontWeight: 600 }}
            >
              {loading
                ? <><span className="spinner" /> Entrando...</>
                : 'Entrar'}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 20, padding: '10px 14px',
            background: 'var(--bg2)', borderRadius: 'var(--radius)',
            fontSize: 12, color: 'var(--text3)', textAlign: 'center',
            fontFamily: 'var(--mono)',
          }}>
            Demo: admin@decillion.com &nbsp;/&nbsp; admin123
          </div>
        </div>
      </motion.div>
    </div>
  )
}