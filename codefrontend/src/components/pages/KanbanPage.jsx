import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import Badge from "../shared/Badge"
import TagPill from "../shared/TagPill"
import { KANBAN_COLS, KANBAN_COL_KEYS, PAYMENT_STATUS } from "../../data/constants"
import { formatCurrency, formatDate, initials, avatarColor, progressBarColor } from "../../utils/helpers"
import { supabase } from "../../lib/supabase"
import { fetchClients, updateClient } from "../../services/clientsService"

export default function KanbanPage({ addToast }) {
  const [clients, setClients] = useState([])
  const [draggingId, setDraggingId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const data = await fetchClients()
    setClients(data)
  }

  function onDragStart(id) {
    setDraggingId(id)
  }

  function onDragOver(e, col) {
    e.preventDefault()
    setOverCol(col)
  }

  async function onDrop(targetCol) {
    setOverCol(null)

    const client = clients.find(c => c.id === draggingId)
    if (!client || client.kanbanCol === targetCol) return

    try {
      const updated = await updateClient(client.id, { kanbanCol: targetCol })

      setClients(prev =>
        prev.map(c => (c.id === updated.id ? updated : c))
      )

      addToast?.("Movido com sucesso", "success")
    } catch {
      addToast?.("Erro ao mover", "error")
    }

    setDraggingId(null)
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
      {KANBAN_COL_KEYS.map(colKey => {
        const col = KANBAN_COLS[colKey]
        const colItems = clients.filter(c => (c.kanbanCol || "backlog") === colKey)

        return (
          <div
            key={colKey}
            onDragOver={e => onDragOver(e, colKey)}
            onDrop={() => onDrop(colKey)}
            style={{ background: "#111520", padding: 12, borderRadius: 12 }}
          >
            <div style={{ marginBottom: 10, color: col.color }}>{col.label}</div>

            <AnimatePresence>
              {colItems.map(c => (
                <motion.div
                  key={c.id}
                  draggable
                  onDragStart={() => onDragStart(c.id)}
                  style={{ background: "#161b2a", padding: 10, marginBottom: 8, borderRadius: 8 }}
                >
                  <div>{c.projectName || c.name}</div>
                  <div>{formatCurrency(c.projectValue)}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}