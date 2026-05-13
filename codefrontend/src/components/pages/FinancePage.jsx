import { useMemo } from 'react'

// ── helpers inline ────────────────────────────────────────────────
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)
}

// ── Badge ─────────────────────────────────────────────────────────
const BADGE_COLOR = {
  green:  { bg: 'rgba(34,201,125,.12)',  color: '#22c97d' },
  amber:  { bg: 'rgba(245,158,11,.12)',  color: '#f59e0b' },
  red:    { bg: 'rgba(239,68,68,.12)',   color: '#ef4444' },
  blue:   { bg: 'rgba(79,110,247,.12)',  color: '#4f6ef7' },
  gray:   { bg: 'rgba(90,100,120,.15)',  color: '#8892a4' },
}

function Badge({ colorKey, label }) {
  const s = BADGE_COLOR[colorKey] ?? BADGE_COLOR.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 700,
      fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.3px',
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────────────────────
function StatCard({ label, value, delta, deltaType = 'up', iconColor }) {
  const ic = BADGE_COLOR[iconColor]?.color ?? '#4f6ef7'
  return (
    <div style={{
      background: '#111520', border: '1px solid rgba(255,255,255,.06)',
      borderRadius: 12, padding: 16,
    }}>
      <div style={{
        fontSize: 10, color: '#5a6478', textTransform: 'uppercase',
        letterSpacing: '.8px', fontFamily: 'monospace', marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 500, color: '#e8eaf0', letterSpacing: -1 }}>
        {value}
      </div>
      {delta && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8,
          fontSize: 10, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 4,
          background: deltaType === 'up' ? 'rgba(34,201,125,.1)' : 'rgba(239,68,68,.1)',
          color:      deltaType === 'up' ? '#22c97d'             : '#ef4444',
        }}>
          {deltaType === 'up' ? '↑' : '↓'} {delta}
        </div>
      )}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div style={{
      background: '#111520', border: '1px solid rgba(255,255,255,.06)',
      borderRadius: 12, padding: 16,
    }}>
      {title && (
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e8eaf0', marginBottom: 16 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

// ── FinancePage ───────────────────────────────────────────────────
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
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: i < recentPaid.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge colorKey="green" label="Pago" />
                  <span style={{ fontSize: 12, color: '#8892a4' }}>{c.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: '#22c97d' }}>
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
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,.04)' : 'none',
              }}
            >
              <span style={{ fontSize: r.bold ? 13 : 11, color: r.bold ? '#e8eaf0' : '#8892a4', fontWeight: r.bold ? 600 : 400 }}>
                {r.label}
              </span>
              <span style={{ fontSize: r.bold ? 15 : 13, fontWeight: r.bold ? 700 : 600, fontFamily: 'monospace', color: r.color }}>
                {r.value}
              </span>
            </div>
          ))}
        </Card>

      </div>
    </div>
  )
}
