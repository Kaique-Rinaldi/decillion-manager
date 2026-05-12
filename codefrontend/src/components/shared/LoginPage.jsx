import { useState } from 'react'
import { motion } from 'framer-motion'

export default function LoginPage({ onLogin, onRegister, loading, error, clearError }) {
  const [mode,     setMode]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [localErr, setLocalErr] = useState('')
  const [regOk,    setRegOk]    = useState(false)

  const combinedError = localErr || error

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalErr('')
    clearError?.()

    if (!email.trim() || !password.trim()) {
      setLocalErr('Preencha email e senha.')
      return
    }

    if (mode === 'register') {
      if (password !== confirm) {
        setLocalErr('As senhas não coincidem.')
        return
      }
      if (password.length < 6) {
        setLocalErr('Senha deve ter ao menos 6 caracteres.')
        return
      }
      const result = await onRegister(email.trim(), password)
      if (result?.success) {
        if (result.needsConfirmation) setRegOk(true)
      }
    } else {
      await onLogin(email.trim(), password)
    }
  }

  const inputStyle = {
    width: '100%', background: '#161b2a',
    border: '1px solid rgba(255,255,255,.15)', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, color: '#e8eaf0',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  if (regOk) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0d14',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <motion.div
          initial={{ scale: .94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: '#111520', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 16, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e8eaf0', marginBottom: 8 }}>
            Verifique seu email
          </div>
          <div style={{ fontSize: 13, color: '#8892a4', lineHeight: 1.6, marginBottom: 24 }}>
            Enviamos um link de confirmação para <strong style={{ color: '#e8eaf0' }}>{email}</strong>.
            Confirme seu email para ativar a conta.
          </div>
          <button
            onClick={() => { setRegOk(false); setMode('login') }}
            style={{
              padding: '10px 24px', borderRadius: 8, background: '#4f6ef7',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Ir para o login
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0d14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans',sans-serif", padding: 20,
    }}>
      <motion.div
        initial={{ scale: .94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: .2 }}
        style={{
          background: '#111520', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 18, padding: 40, maxWidth: 420, width: '100%',
          boxShadow: '0 28px 80px rgba(0,0,0,.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px',
            background: 'linear-gradient(135deg,#4f6ef7,#a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff',
          }}>D</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#e8eaf0', letterSpacing: '-.3px' }}>
            Decillion
          </div>
          <div style={{
            fontSize: 11, color: '#5a6478', marginTop: 4, fontFamily: 'monospace',
            textTransform: 'uppercase', letterSpacing: '.8px',
          }}>
            {mode === 'login' ? 'Acesse sua conta' : 'Criar nova conta'}
          </div>
        </div>

        <div style={{
          display: 'flex', background: '#161b2a', borderRadius: 10,
          padding: 4, marginBottom: 24,
        }}>
          {[['login','Entrar'],['register','Cadastrar']].map(([m, l]) => (
            <button key={m}
              onClick={() => { setMode(m); setLocalErr(''); clearError?.() }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 7, border: 'none',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                background: mode === m ? '#4f6ef7' : 'transparent',
                color: mode === m ? '#fff' : '#5a6478',
                transition: 'all .15s',
              }}
            >{l}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: '#5a6478', fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" style={inputStyle} autoComplete="email" />
          </div>

          <div style={{ marginBottom: mode === 'register' ? 14 : 20 }}>
            <div style={{ fontSize: 9, color: '#5a6478', fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Senha</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: '#5a6478', fontFamily: 'monospace',
                textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Confirmar senha</div>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" style={inputStyle} autoComplete="new-password" />
            </div>
          )}

          {combinedError && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)',
              fontSize: 12, color: '#ef4444',
            }}>
              {combinedError}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px 0', borderRadius: 9,
            background: loading ? '#2d3a6b' : '#4f6ef7', border: 'none',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background .15s',
          }}>
            {loading && (
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,.3)',
                borderTopColor: '#fff', animation: 'spin .6s linear infinite',
              }} />
            )}
            {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div style={{
          marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)',
          textAlign: 'center', fontSize: 11, color: '#5a6478',
        }}>
          Decillion Manager v3.0 · Powered by Supabase
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}