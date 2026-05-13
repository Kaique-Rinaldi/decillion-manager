import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { fetchDeals } from "../services/dealsService"

import StatCard from "../components/shared/StatCard"
import Card from "../components/shared/Card"
import Badge from "../components/shared/Badge"

import { PAYMENT_STATUS, PIPELINE_STAGE, PIPELINE_STAGE_KEYS } from "../data/constants"
import { formatCurrency, initials, avatarColor } from "../utils/helpers"

function RecentRow({ client }) {
  const pal = avatarColor(client.name)
  const ps = PAYMENT_STATUS[client.paymentStatus] ?? PAYMENT_STATUS.pendente

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
      borderBottom: "1px solid rgba(255,255,255,.05)" }}>

      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: pal.bg, color: pal.fg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700
      }}>
        {initials(client.name)}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: "#e8eaf0" }}>
          {client.name}
        </div>
        <div style={{ fontSize: 10, color: "#5a6478" }}>
          {client.company || client.email}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, color: "#22c97d", fontFamily: "monospace" }}>
          {formatCurrency(client.projectValue || 0)}
        </div>
        <Badge colorKey={ps.badge} label={ps.label} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [clients, setClients] = useState([])
  const [deals, setDeals] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dealsData = await fetchDeals(user.id)

    setDeals(dealsData)
    setClients([]) // ainda não conectado ao Supabase clients (se quiser, conecto depois)
  }

  const activeClients = clients.filter(c => c.projectStatus === "andamento").length
  const totalRevenue = clients.reduce((s, c) =>
    s + (c.paymentStatus === "pago" ? c.projectValue : 0), 0)

  const openDeals = deals.filter(d => d.stage !== "won").length
  const wonDeals = deals.filter(d => d.stage === "won")

  const convRate =
    deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0

  const stageCounts = PIPELINE_STAGE_KEYS.map(k => ({
    n: PIPELINE_STAGE[k].label,
    c: deals.filter(d => d.stage === k).length,
    color: PIPELINE_STAGE[k].color,
  }))

  const maxStageCount = Math.max(...stageCounts.map(s => s.c), 1)

  const recent = [...clients]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 5)

  return (
    <div>

      {/* CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>

        <StatCard
          label="Clientes ativos"
          value={activeClients}
          delta={`de ${clients.length}`}
        />

        <StatCard
          label="Receita"
          value={formatCurrency(totalRevenue)}
          delta="clientes pagos"
        />

        <StatCard
          label="Deals abertos"
          value={openDeals}
          delta={`${wonDeals.length} ganhos`}
        />

        <StatCard
          label="Conversão"
          value={`${convRate}%`}
          delta="won / total"
        />

      </div>

      {/* PIPELINE */}
      <Card title="Pipeline">
        {stageCounts.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 80, fontSize: 11 }}>{s.n}</div>

            <div style={{ flex: 1, background: "#1c2236", height: 8 }}>
              <div style={{
                width: `${(s.c / maxStageCount) * 100}%`,
                height: "100%",
                background: s.color
              }} />
            </div>

            <div style={{ width: 20 }}>{s.c}</div>
          </div>
        ))}
      </Card>

      {/* RECENT */}
      <Card title="Recentes">
        {recent.length === 0
          ? <p style={{ color: "#5a6478" }}>Sem dados</p>
          : recent.map(c => <RecentRow key={c.id} client={c} />)
        }
      </Card>

    </div>
  )
}