import { useMemo } from 'react'

import StatCard from '../components/shared/StatCard'
import Card from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import { formatCurrency } from '../utils/helpers'

export default function FinancePage({ clients = [] }) {

  const paidValue = useMemo(() => 
    clients
      .filter(c => c.paymentStatus === 'pago')
      .reduce((s, c) => s + (c.projectValue || 0), 0)
  , [clients])

  const pendingValue = useMemo(() => 
    clients
      .filter(c => c.paymentStatus === 'pendente')
      .reduce((s, c) => s + (c.projectValue || 0), 0)
  , [clients])

  const overdueValue = useMemo(() => 
    clients
      .filter(c => c.paymentStatus === 'atrasado')
      .reduce((s, c) => s + (c.projectValue || 0), 0)
  , [clients])

  const totalValue = paidValue + pendingValue + overdueValue

  const recentPaid = useMemo(() =>
    [...clients]
      .filter(c => c.paymentStatus === 'pago')
      .sort((a, b) => (b.endDate || '').localeCompare(a.endDate || ''))
      .slice(0, 5)
  , [clients])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        
        <StatCard
          label="Receita recebida"
          value={formatCurrency(paidValue)}
          delta={`${Math.round((paidValue / (totalValue || 1)) * 100)}% do total`}
          iconColor="green"
        />

        <StatCard
          label="A receber"
          value={formatCurrency(pendingValue)}
          delta={`${clients.filter(c => c.paymentStatus === 'pendente').length} pagamentos`}
          iconColor="amber"
        />

        <StatCard
          label="Em atraso"
          value={formatCurrency(overdueValue)}
          delta={`${clients.filter(c => c.paymentStatus === 'atrasado').length} clientes`}
          deltaType="down"
          iconColor="red"
        />

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        <Card title="Pagamentos confirmados">
          {recentPaid.length === 0
            ? (
              <div style={{ textAlign: 'center', color: '#5a6478', padding: '24px 0', fontSize: 12 }}>
                Nenhum pagamento ainda
              </div>
            )
            : recentPaid.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: i < recentPaid.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge colorKey="green" label="Pago" />
                  <span style={{ fontSize: 12, color: '#8892a4' }}>
                    {c.name}
                  </span>
                </div>

                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: '#22c97d'
                }}>
                  +{formatCurrency(c.projectValue || 0)}
                </span>
              </div>
            ))
          }
        </Card>

        <Card title="Resumo geral">
          {[
            { label: 'Receita bruta',     value: formatCurrency(totalValue),   color: '#e8eaf0' },
            { label: 'Recebido',          value: formatCurrency(paidValue),    color: '#22c97d' },
            { label: 'Pendente',          value: formatCurrency(pendingValue), color: '#f59e0b' },
            { label: 'Em atraso',         value: formatCurrency(overdueValue), color: '#ef4444' },
            { label: 'Total de clientes', value: clients.length,               color: '#e8eaf0', bold: true },
          ].map((r, i) => (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,.04)' : 'none'
              }}
            >
              <span style={{
                fontSize: r.bold ? 13 : 11,
                color: r.bold ? '#e8eaf0' : '#8892a4',
                fontWeight: r.bold ? 600 : 400
              }}>
                {r.label}
              </span>

              <span style={{
                fontSize: r.bold ? 15 : 13,
                fontWeight: r.bold ? 700 : 600,
                fontFamily: 'monospace',
                color: r.color
              }}>
                {r.value}
              </span>
            </div>
          ))}
        </Card>

      </div>
    </div>
  )
}