import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { PIPELINE_STAGE, PIPELINE_STAGE_KEYS } from "../../data/constants"
import { formatCurrency } from "../../utils/helpers"
import { supabase } from "../../lib/supabase"
import { fetchDeals, updateDeal } from "../../services/dealsService"

export default function PipelinePage({ addToast }) {
  const [deals, setDeals] = useState([])
  const [draggingId, setDraggingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const data = await fetchDeals(user.id)
    setDeals(data)
  }

  async function onDrop(stage) {
    const deal = deals.find(d => d.id === draggingId)
    if (!deal) return

    try {
      const updated = await updateDeal(deal.id, { stage })

      setDeals(prev =>
        prev.map(d => (d.id === updated.id ? updated : d))
      )

      addToast?.("Atualizado", "success")
    } catch {
      addToast?.("Erro", "error")
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
      {PIPELINE_STAGE_KEYS.map(stage => (
        <div key={stage} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(stage)}>
          <h4>{PIPELINE_STAGE[stage].label}</h4>

          <AnimatePresence>
            {deals.filter(d => d.stage === stage).map(d => (
              <motion.div
                key={d.id}
                draggable
                onDragStart={() => setDraggingId(d.id)}
                style={{ background: "#161b2a", padding: 10, marginBottom: 8 }}
              >
                <div>{d.name}</div>
                <div>{formatCurrency(d.value)}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}