import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id: 'clients',   label: 'Clientes',     icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ activeTab, onTabChange, user, onLogout, clientCount }) {
  const [collapsed, setCollapsed] = useState(false)

  const W = collapsed ? 64 : 220

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        width: W, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: 'var(--accent)', color: 'var(--accent-fg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700,
          }}>D</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: .15 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.3px' }}>
                  Decillion
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: '.3px' }}>
                  Manager
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <button
            className="btn-icon"
            onClick={() => setCollapsed(true)}
            style={{ width: 28, height: 28, flexShrink: 0 }}
            title="Recolher"
          >
            <Icon d="M15 18l-6-6 6-6" size={13} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            margin: '8px 10px 0', padding: '6px', borderRadius: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text3)', display: 'flex', justifyContent: 'center',
          }}
          title="Expandir"
        >
          <Icon d="M9 18l6-6-6-6" size={13} />
        </button>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              title={collapsed ? label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 10, padding: collapsed ? '10px' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 9, border: 'none', cursor: 'pointer',
                marginBottom: 2, fontFamily: 'var(--font)', fontSize: 13,
                fontWeight: active ? 600 : 400, transition: 'all .14s',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--accent-fg)' : 'var(--text2)',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ flexShrink: 0, opacity: active ? 1 : .7 }}>
                <Icon d={icon} size={15} />
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }} transition={{ duration: .12 }}
                    style={{ whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Badge for clients count */}
              {!collapsed && id === 'clients' && clientCount > 0 && (
                <span style={{
                  fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 600,
                  padding: '1px 5px', borderRadius: 10,
                  background: active ? 'rgba(255,255,255,.2)' : 'var(--bg2)',
                  color: active ? 'rgba(255,255,255,.9)' : 'var(--text3)',
                }}>
                  {clientCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: collapsed ? '12px 8px' : '12px 8px',
      }}>
        {!collapsed && (
          <div style={{
            padding: '8px 10px', borderRadius: 9,
            background: 'var(--bg)', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: 'var(--accent)', color: 'var(--accent-fg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}>AD</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name ?? 'Admin'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--mono)' }}>
                {user?.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="btn btn-ghost btn-sm"
          title="Sair"
          style={{
            width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8, color: 'var(--text3)',
          }}
        >
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={14} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </motion.aside>
  )
}