import { useMemo } from 'react'
import { motion } from 'framer-motion'

import StatCard from '../components/shared/StatCard'
import Card from '../components/shared/Card'
import { PAYMENT_STATUS } from '../data/constants'
import { formatCurrency } from '../utils/helpers'

const BADGE_COLOR = {
  green:  { color: '#22c97d' },
  amber:  { color: '#f59e0b' },
  red:    { color: '#ef4444' },
  blue:   { color: '#4f6ef7' },
  purple: { color: '#a78bfa' },
  gray:   { color: '#8892a4' },
}

export default function ReportsPage() {
  const { clients, deals } = useAppStore()

  const wonDeals  = useMemo(() => deals.filter(d => d.stage === 'fechado'), [deals])
  const convRate  = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0
  const avgTicket = wonDeals.length > 0 ? wonDeals.reduce((s, d) => s + d.value, 0) / wonDeals.length : 0

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total clientes"       value={clients.length} />
        <StatCard label="Negociações fechadas" value={wonDeals.length} />
        <StatCard label="Taxa conversão"       value={`${convRate}%`} />
        <StatCard label="Ticket médio"         value={formatCurrency(avgTicket)} />
      </div>
      <Card title="Distribuição por status de pagamento">
        {Object.entries(PAYMENT_STATUS).map(([key, s]) => {
          const count = clients.filter(c => (c.paymentStatus || 'pendente') === key).length
          const pct   = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0
          return (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, fontWeight: 500 }}>
                <span style={{ color: '#8892a4' }}>{s.label}</span>
                <span style={{ color: '#5a6478', fontFamily: 'monospace' }}>{count} ({pct}%)</span>
              </div>
              <div style={{ height: 6, background: '#1c2236', borderRadius: 10, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: .6, ease: 'easeOut' }}
                  style={{ height: '100%', background: BADGE_COLOR[s.badge]?.color ?? '#8892a4', borderRadius: 10 }}
                />
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}