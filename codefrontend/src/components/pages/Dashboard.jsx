import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

import { fetchClients } from "../services/clientService"
import { fetchDeals } from "../services/dealsService"

import StatCard from "../components/shared/StatCard"
import Card from "../components/shared/Card"
import Badge from "../components/shared/Badge"

import { PAYMENT_STATUS } from "../data/constants"
import { formatCurrency, initials, avatarColor } from "../utils/helpers"

function RecentRow({ client }) {
  const pal = avatarColor(client?.name || "")
  const ps = PAYMENT_STATUS[client?.paymentStatus] || PAYMENT_STATUS.pendente

  return (
    <div style={{ display: "flex", gap: 10, padding: "8px 0" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: pal.bg,
          color: pal.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700
        }}
      >
        {initials(client?.name || "")}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12 }}>{client?.name || "Sem nome"}</div>
        <div style={{ fontSize: 10, color: "#666" }}>
          {client?.company || client?.email || ""}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#22c55e" }}>
          {formatCurrency(client?.projectValue || 0)}
        </div>
        <Badge label={ps.label} colorKey={ps.badge} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [deals, setDeals] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [clientsData, dealsData] = await Promise.all([
      fetchClients(user.id),
      fetchDeals(user.id)
    ])

    setClients(clientsData || [])
    setDeals(dealsData || [])
  }

  const activeClients = clients.filter(c => c.projectStatus === "andamento").length

  const revenue = clients.reduce((sum, c) => {
    if (c.paymentStatus === "pago") return sum + (c.projectValue || 0)
    return sum
  }, 0)

  const openDeals = deals.filter(d => d.stage !== "fechado").length
  const wonDeals = deals.filter(d => d.stage === "fechado")

  const conversion =
    deals.length > 0
      ? Math.round((wonDeals.length / deals.length) * 100)
      : 0

  const recent = [...clients]
    .sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || "")
    )
    .slice(0, 5)

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Clientes ativos" value={activeClients} />
        <StatCard label="Receita" value={formatCurrency(revenue)} />
        <StatCard label="Deals abertos" value={openDeals} />
        <StatCard label="Conversão" value={`${conversion}%`} />
      </div>

      <div style={{ marginTop: 20 }}>
        <Card title="Clientes recentes">
          {recent.length === 0 ? (
            <div style={{ color: "#777" }}>Nenhum cliente ainda</div>
          ) : (
            recent.map(c => (
              <RecentRow key={c?.id} client={c} />
            ))
          )}
        </Card>
      </div>
    </div>
  )
}