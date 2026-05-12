
import StatCard from '../components/shared/StatCard'
import Card from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import { PAYMENT_STATUS, PIPELINE_STAGE, PIPELINE_STAGE_KEYS } from '../data/constants'
import { formatCurrency, formatDate, initials, avatarColor } from '../utils/helpers'

function RecentRow({ client }) {
  const pal = avatarColor(client.name)
  const ps  = PAYMENT_STATUS[client.paymentStatus] ?? PAYMENT_STATUS.pendente
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
      borderBottom: '1px solid rgba(255,255,255,.05)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: pal.bg, color: pal.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{initials(client.name)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#e8eaf0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
        <div style={{ fontSize: 10, color: '#5a6478' }}>{client.company || client.email}</div>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontSize: 12, color: '#22c97d', fontFamily: 'monospace', fontWeight: 600 }}>
          {formatCurrency(client.projectValue)}
        </div>
        <div style={{ marginTop: 2 }}>
          <Badge colorKey={ps.badge} label={ps.label} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { clients, deals } = useAppStore()

  const activeClients = clients.filter(c => c.projectStatus === 'andamento').length
  const totalRevenue  = clients.reduce((s, c) => s + (c.paymentStatus === 'pago' ? c.projectValue : 0), 0)
  const openDeals     = deals.filter(d => d.stage !== 'fechado').length
  const wonDeals      = deals.filter(d => d.stage === 'fechado')
  const convRate      = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0

  const stageCounts = PIPELINE_STAGE_KEYS.map(k => ({
    n: PIPELINE_STAGE[k].label,
    c: deals.filter(d => d.stage === k).length,
    color: PIPELINE_STAGE[k].color,
  }))
  const maxStageCount = Math.max(...stageCounts.map(s => s.c), 1)

  const REVENUE_DATA = [
    { month: 'Dez', value: 28 }, { month: 'Jan', value: 34 }, { month: 'Fev', value: 31 },
    { month: 'Mar', value: 42 }, { month: 'Abr', value: 38 },
    { month: 'Mai', value: wonDeals.reduce((s, d) => s + d.value, 0) / 1000 || 47 },
  ]
  const maxR  = Math.max(...REVENUE_DATA.map(r => r.value))
  const recent = [...clients].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard
          label="Clientes em andamento" value={activeClients}
          delta={`de ${clients.length} total`}
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          iconColor="blue"
        />
        <StatCard
          label="Receita recebida" value={formatCurrency(totalRevenue)}
          delta="pagamentos confirmados"
          iconPath="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2"
          iconColor="green"
        />
        <StatCard
          label="Negociações em aberto" value={openDeals}
          delta={`${wonDeals.length} fechadas`}
          iconPath="M4 6h16M4 12h16M4 18h16"
          iconColor="amber"
        />
        <StatCard
          label="Taxa de conversão" value={`${convRate}%`}
          delta="negociações ganhas / total"
          iconPath="M18 20V10M12 20V4M6 20v-6"
          iconColor="purple"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <Card title="Receita (últimos 6 meses)">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80 }}>
            {REVENUE_DATA.map((r, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: `${(r.value / maxR) * 100}%`,
                  background: i === REVENUE_DATA.length - 1 ? '#4f6ef7' : '#1c2236',
                }} />
                <div style={{ fontSize: 8, color: '#5a6478', fontFamily: 'monospace', marginTop: 4 }}>{r.month}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Pipeline por etapa" sub="Negociações ativas">
          {stageCounts.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#8892a4', width: 76, fontFamily: 'monospace',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.n}</div>
              <div style={{ flex: 1, background: '#1c2236', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{
                  background: s.color, height: '100%',
                  width: `${(s.c / maxStageCount) * 100}%`,
                  borderRadius: 4, transition: 'width .4s',
                }} />
              </div>
              <div style={{ fontSize: 10, color: '#5a6478', fontFamily: 'monospace', width: 14, textAlign: 'right' }}>{s.c}</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card title="Clientes recentes">
          {recent.length === 0
            ? <div style={{ textAlign: 'center', color: '#5a6478', padding: '24px 0', fontSize: 12 }}>Nenhum cliente ainda</div>
            : recent.map(c => <RecentRow key={c.id} client={c} />)
          }
        </Card>
        <Card title="Status dos projetos" sub="Distribuição atual">
          {[
            { label: 'Em andamento', count: clients.filter(c => c.projectStatus === 'andamento').length, color: '#4f6ef7' },
            { label: 'Concluídos',   count: clients.filter(c => c.projectStatus === 'concluido').length, color: '#22c97d' },
            { label: 'Cancelados',   count: clients.filter(c => c.projectStatus === 'cancelado').length, color: '#8892a4' },
          ].map((s, i) => {
            const pct = clients.length > 0 ? Math.round((s.count / clients.length) * 100) : 0
            return (
              <div key={s.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                  <span style={{ color: '#8892a4' }}>{s.label}</span>
                  <span style={{ color: '#5a6478', fontFamily: 'monospace' }}>{s.count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: '#1c2236', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: s.color, borderRadius: 4,
                    width: `${pct}%`, transition: 'width .6s',
                  }} />
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}