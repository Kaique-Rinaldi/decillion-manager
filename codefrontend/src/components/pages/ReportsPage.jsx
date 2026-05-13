import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { fetchClients } from "../../services/clientsService"
import { fetchDeals } from "../../services/dealsService"
import { formatCurrency } from "../../utils/helpers"

export default function ReportsPage() {
  const [clients, setClients] = useState([])
  const [deals, setDeals] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const clientsData = await fetchClients()
    const dealsData = await fetchDeals(user.id)

    setClients(clientsData)
    setDeals(dealsData)
  }

  const won = deals.filter(d => d.stage === "fechado")

  return (
    <div>
      <h3>Total Clientes: {clients.length}</h3>
      <h3>Deals Fechados: {won.length}</h3>
      <h3>Faturamento: {formatCurrency(won.reduce((s, d) => s + d.value, 0))}</h3>
    </div>
  )
}