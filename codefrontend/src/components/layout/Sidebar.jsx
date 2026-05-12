import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../shared/Icon'
import { NAV_SECTIONS } from '../../data/constants'
import { initials } from '../../utils/helpers'

export default function Sidebar({ activeTab, onTabChange, user, onLogout, badgeCounts }) {
  const [collapsed, setCollapsed] = useState(false)

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        flexShrink: 0, background: '#111520',
        borderRight: '1px solid rgba(255,255,255,.06)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden', position: 'relative',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg,#4f6ef7,#a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#fff',
          }}>D</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: .15 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e8eaf0', letterSpacing: '-.3px' }}>
                  Decillion
                </div>
                <div style={{ fontSize: 10, color: '#3a4255', fontFamily: 'monospace', letterSpacing: '.3px' }}>
                  Manager v3.0
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              width: 28, height: 28, borderRadius: 7, background: 'transparent',
              border: '1px solid rgba(255,255,255,.07)', cursor: 'pointer',
              color: '#5a6478', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Recolher"
          >
            <Icon d="M15 18l-6-6 6-6" size={13} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            margin: '8px 10px 0', padding: '6px', borderRadius: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#5a6478', display: 'flex', justifyContent: 'center',
          }}
          title="Expandir"
        >
          <Icon d="M9 18l6-6-6-6" size={13} />
        </button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <div style={{
                fontSize: 9, color: '#3a4255', textTransform: 'uppercase', letterSpacing: 1,
                fontWeight: 600, padding: '8px 8px 6px', fontFamily: 'monospace',
              }}>{section.label}</div>
            )}
            {section.items.map(({ id, label, icon, badgeKey }) => {
              const active = activeTab === id
              const badgeCount = badgeKey ? badgeCounts?.[badgeKey] : undefined
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  title={collapsed ? label : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: collapsed ? '10px' : '7px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    marginBottom: 1, fontFamily: 'inherit', fontSize: 12.5,
                    fontWeight: active ? 600 : 400, transition: 'all .14s',
                    background: active ? '#4f6ef7' : 'transparent',
                    color:      active ? '#fff'    : '#8892a4',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#161b2a'; e.currentTarget.style.color = '#e8eaf0' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8892a4' } }}
                >
                  <Icon d={icon} size={14} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }} transition={{ duration: .12 }}
                        style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && badgeCount !== undefined && badgeCount > 0 && (
                    <span style={{
                      fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                      padding: '1px 5px', borderRadius: 10,
                      background: active ? 'rgba(255,255,255,.2)' : '#1c2236',
                      border: `1px solid ${active ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.08)'}`,
                      color: active ? 'rgba(255,255,255,.8)' : '#5a6478',
                    }}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}

        {/* Keyboard shortcuts hint */}
        {!collapsed && (
          <div style={{ padding: '0 4px', marginTop: 8 }}>
            <div style={{
              fontSize: 9, color: '#3a4255', fontFamily: 'monospace', lineHeight: 1.8,
              padding: '8px 10px', background: '#0d1018',
              borderRadius: 8, border: '1px solid rgba(255,255,255,.04)',
            }}>
              {[['1','Dashboard'],['2','Pipeline'],['3','Clientes'],['4','Kanban'],['5','Tarefas']].map(([k, l]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#5a6478' }}>{l}</span>
                  <span style={{ background: '#161b2a', padding: '0 4px', borderRadius: 3 }}>{k}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User + Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: '12px 8px' }}>
        {!collapsed && (
          <div style={{
            padding: '8px 10px', borderRadius: 9, background: '#161b2a',
            border: '1px solid rgba(255,255,255,.06)', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg,#4f6ef7,#a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, color: '#fff',
            }}>
              {initials(displayName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#e8eaf0', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: 9, color: '#3a4255', fontFamily: 'monospace',
                textTransform: 'uppercase', letterSpacing: '.5px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          title="Sair"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, background: 'transparent', border: 'none',
            cursor: 'pointer', color: '#5a6478', fontSize: 12, fontFamily: 'inherit',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.08)'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a6478' }}
        >
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={13} />
          {!collapsed && <span>Sair da conta</span>}
        </button>
      </div>
    </motion.aside>
  )
}