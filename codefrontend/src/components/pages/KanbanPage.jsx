import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { KANBAN_COLS, KANBAN_COL_KEYS } from "../../data/constants"
import { formatCurrency } from "../../utils/helpers"
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

    const data = await fetchClients(user.id)
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

    // OTIMISTA (UX PROFISSIONAL)
    setClients(prev =>
      prev.map(c =>
        c.id === client.id ? { ...c, kanbanCol: targetCol } : c
      )
    )

    try {
      await updateClient(client.id, { kanbanCol: targetCol })
      addToast?.("Movido com sucesso", "success")
    } catch {
      addToast?.("Erro ao mover", "error")

      // rollback
      setClients(prev =>
        prev.map(c =>
          c.id === client.id ? client : c
        )
      )
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
            style={{
              background: "#111520",
              padding: 12,
              borderRadius: 12,
              border: overCol === colKey ? `1px solid ${col.color}` : "1px solid transparent"
            }}
          >
            <div style={{ marginBottom: 10, color: col.color }}>
              {col.label} ({colItems.length})
            </div>

            <AnimatePresence>
              {colItems.map(c => (
                <motion.div
                  key={c.id}
                  draggable
                  onDragStart={() => onDragStart(c.id)}
                  style={{
                    background: "#161b2a",
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 8,
                    cursor: "grab"
                  }}
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