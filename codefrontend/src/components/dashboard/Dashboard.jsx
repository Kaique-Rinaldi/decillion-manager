import { motion } from 'framer-motion'
import { formatCurrency, initials, avatarPalette } from '../../utils/helpers'
import { PAYMENT_STATUS } from '../../data/mockData'

function StatCard({ label, value, sub, accent, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .25, delay }}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px',
        boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: '.6px' }}>{label}</div>
        <div style={{ fontSize: 20 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? 'var(--text)',
        letterSpacing: '-1px', lineHeight: 1.1, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </motion.div>
  )
}

function RecentRow({ client, index }) {
  const pal = avatarPalette(client.name)
  const pStatus = PAYMENT_STATUS[client.paymentStatus]
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: .2, delay: index * .05 }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
        borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: pal.bg,
        color: pal.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700 }}>
        {initials(client.name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{client.company || client.email}</div>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
          {formatCurrency(client.projectValue)}
        </div>
        <span className={`badge ${pStatus?.badge ?? 'badge-gray'}`} style={{ fontSize: 9, padding: '1px 7px', marginTop: 3, display: 'inline-flex' }}>
          {pStatus?.label}
        </span>
      </div>
    </motion.div>
  )
}

export default function Dashboard({ stats, clients, onNavigateToClients }) {
  const recent = [...clients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div style={{ padding: '28px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.4px' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Visão geral do seu negócio</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total clientes"   value={stats.total}                       icon="👥" delay={0} />
        <StatCard label="Projetos ativos"  value={stats.active}                      icon="⚡" delay={.05}  accent="var(--blue)" />
        <StatCard label="Total faturado"   value={formatCurrency(stats.totalValue)}   icon="💰" delay={.1}   accent="var(--green)" />
        <StatCard label="Valor recebido"   value={formatCurrency(stats.paidValue)}    icon="✅" delay={.15}  accent="var(--green)" sub="confirmados" />
        <StatCard label="Valor pendente"   value={formatCurrency(stats.pendingValue)} icon="⏳" delay={.2}   accent="var(--amber)" />
        <StatCard label="Em atraso"        value={stats.overdue}                     icon="⚠️" delay={.25}  accent={stats.overdue > 0 ? 'var(--red)' : 'var(--text)'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Clientes recentes</h2>
            <button className="btn btn-ghost btn-sm" onClick={onNavigateToClients}
              style={{ fontSize: 11, color: 'var(--text3)' }}>Ver todos →</button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>Últimos {recent.length} cadastros</div>
          {recent.length === 0
            ? <div className="empty-state" style={{ padding: '32px 0' }}><div className="empty-icon">👤</div><div className="empty-title">Nenhum cliente</div></div>
            : <div>{recent.map((c, i) => <RecentRow key={c.id} client={c} index={i} />)}</div>
          }
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Status dos projetos</h2>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>Distribuição atual</div>
          {[
            { label: 'Em andamento', count: stats.active,    color: 'var(--blue)' },
            { label: 'Concluídos',   count: stats.concluded, color: 'var(--green)' },
            { label: 'Cancelados',   count: Math.max(0, stats.total - stats.active - stats.concluded), color: 'var(--text3)' },
          ].map((s, i) => {
            const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0
            return (
              <div key={s.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, fontWeight: 500 }}>
                  <span style={{ color: 'var(--text2)' }}>{s.label}</span>
                  <span style={{ color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{s.count} ({pct}%)</span>
                </div>
                <div style={{ height: 7, background: 'var(--bg2)', borderRadius: 10, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: .6, delay: .2 + i * .1, ease: 'easeOut' }}
                    style={{ height: '100%', background: s.color, borderRadius: 10 }} />
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg)',
            borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Projetos concluídos</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', letterSpacing: '-1px' }}>
              {stats.concluded}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}