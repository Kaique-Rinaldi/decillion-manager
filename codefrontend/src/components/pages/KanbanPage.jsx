import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../../lib/supabase"
import { fetchClients, updateClient } from "../../services/clientsService"

const COLS = {
  backlog:   { label: "Backlog",      color: "#60a5fa" },
  andamento: { label: "Em andamento", color: "#a78bfa" },
  revisao:   { label: "Revisão",      color: "#f59e0b" },
  concluido: { label: "Concluído",    color: "#22c97d" },
}
const COL_KEYS = ["backlog", "andamento", "revisao", "concluido"]

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0)
}
function initials(name = "") {
  return name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
}
const AVATAR_PALETTE = [
  { bg: "rgba(79,110,247,.15)",  fg: "#4f6ef7" },
  { bg: "rgba(167,139,250,.15)", fg: "#a78bfa" },
  { bg: "rgba(34,201,125,.15)",  fg: "#22c97d" },
  { bg: "rgba(245,158,11,.15)",  fg: "#f59e0b" },
  { bg: "rgba(236,72,153,.15)",  fg: "#ec4899" },
]
function avatarColor(name = "") {
  if (!name) return AVATAR_PALETTE[0]
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}
const BADGE = {
  pendente: { label: "Pendente", color: "#f59e0b" },
  pago:     { label: "Pago",     color: "#22c97d" },
  atrasado: { label: "Atrasado", color: "#ef4444" },
}

// ─── Normaliza o client vindo do Supabase ────────────────────────────────────
// O Supabase retorna snake_case (kanban_col), mas o código usa camelCase (kanbanCol).
// Esta função garante que os dois formatos funcionem.
function normalizeClient(c) {
  return {
    ...c,
    kanbanCol:       c.kanbanCol       ?? c.kanban_col       ?? "backlog",
    projectName:     c.projectName     ?? c.project_name     ?? "",
    projectValue:    c.projectValue    ?? c.project_value    ?? 0,
    projectProgress: c.projectProgress ?? c.project_progress ?? undefined,
    paymentStatus:   c.paymentStatus   ?? c.payment_status   ?? "pendente",
  }
}

export default function KanbanPage({ addToast }) {
  const [clients,    setClients]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [draggingId, setDraggingId] = useState(null)
  const [overCol,    setOverCol]    = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const data = await fetchClients(user.id)
      // Normaliza snake_case → camelCase logo na entrada
      setClients(data.map(normalizeClient))
    } finally {
      setLoading(false)
    }
  }

  function onDragStart(e, id) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = "move"
    // Firefox exige que setData seja chamado para drag funcionar
    e.dataTransfer.setData("text/plain", id)
  }

  function onDragOver(e, col) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setOverCol(col)
  }

  function onDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOverCol(null)
    }
  }

  function onDragEnd() {
    setDraggingId(null)
    setOverCol(null)
  }

  async function onDrop(e, targetCol) {
    e.preventDefault()
    setOverCol(null)

    // Lê o id tanto do state quanto do dataTransfer (fallback para Firefox)
    const id = draggingId ?? e.dataTransfer.getData("text/plain")
    if (!id) return

    const client = clients.find(c => c.id === id)
    if (!client || client.kanbanCol === targetCol) {
      setDraggingId(null)
      return
    }

    // Optimistic update
    setClients(prev =>
      prev.map(c => c.id === id ? { ...c, kanbanCol: targetCol } : c)
    )
    setDraggingId(null)

    try {
      // ✅ FIX PRINCIPAL: envia kanban_col (snake_case) para o Supabase,
      // pois é assim que a coluna está nomeada no banco.
      // Se o seu updateClient já faz essa conversão internamente, remova o kanban_col
      // e deixe apenas kanbanCol — mas ter os dois não quebra nada.
      // updateClient passa o objeto direto pro Supabase sem converter keys,
      // então precisa do nome exato da coluna no banco: kanban_col
      await updateClient(client.id, { kanban_col: targetCol })
      addToast?.(`Movido para "${COLS[targetCol].label}"`, "success")
    } catch (err) {
      console.error("Erro ao mover card:", err)
      addToast?.("Erro ao mover card", "error")
      // Reverte o optimistic update
      setClients(prev =>
        prev.map(c => c.id === client.id ? client : c)
      )
    }
  }

  const totalByCol = (col) =>
    clients
      .filter(c => c.kanbanCol === col)
      .reduce((s, c) => s + (Number(c.projectValue) || 0), 0)

  return (
    <div>
      {/* Totais por coluna */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20,
      }}>
        {COL_KEYS.map(key => {
          const col   = COLS[key]
          const count = clients.filter(c => c.kanbanCol === key).length
          return (
            <div key={key} style={{
              background: "#111520", border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ fontSize: 9, color: col.color, fontFamily: "monospace",
                textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>
                {col.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#e8eaf0", fontFamily: "monospace" }}>
                {count}
              </div>
              <div style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace", marginTop: 2 }}>
                {formatCurrency(totalByCol(key))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {COL_KEYS.map(colKey => {
          const col      = COLS[colKey]
          const colItems = clients.filter(c => c.kanbanCol === colKey)
          const isOver   = overCol === colKey

          return (
            <div
              key={colKey}
              onDragOver={e  => onDragOver(e, colKey)}
              onDragLeave={e => onDragLeave(e)}
              onDrop={e      => onDrop(e, colKey)}
              style={{
                background:   isOver ? col.color + "0d" : "#111520",
                border:       `1px solid ${isOver ? col.color + "60" : "rgba(255,255,255,.06)"}`,
                borderRadius: 12,
                padding:      12,
                minHeight:    200,
                transition:   "all .15s",
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%", background: col.color, flexShrink: 0,
                  }}/>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#e8eaf0",
                    textTransform: "uppercase", letterSpacing: ".5px", fontFamily: "monospace",
                  }}>
                    {col.label}
                  </span>
                </div>
                <span style={{
                  fontSize: 9, padding: "1px 6px", borderRadius: 4, fontFamily: "monospace",
                  background: col.color + "18", color: col.color,
                }}>
                  {colItems.length}
                </span>
              </div>

              {/* Cards */}
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} style={{
                    height: 72, borderRadius: 8, marginBottom: 8,
                    background: "linear-gradient(90deg,#1c2236 25%,#252d42 50%,#1c2236 75%)",
                    backgroundSize: "400% 100%", animation: "shimmer 1.4s ease infinite",
                  }}/>
                ))
              ) : colItems.length === 0 ? (
                <div style={{
                  border: "1px dashed rgba(255,255,255,.07)", borderRadius: 8,
                  padding: "20px 12px", textAlign: "center",
                  color: "#3a4255", fontSize: 11, fontFamily: "monospace",
                }}>
                  Arraste um card aqui
                </div>
              ) : (
                <AnimatePresence>
                  {colItems.map(c => {
                    const pal        = avatarColor(c.name)
                    const pay        = BADGE[c.paymentStatus] ?? BADGE.pendente
                    const isDragging = draggingId === c.id
                    return (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: .95 }}
                        draggable
                        onDragStart={e => onDragStart(e, c.id)}
                        onDragEnd={onDragEnd}
                        style={{
                          background:   "#161b2a",
                          border:       "1px solid rgba(255,255,255,.07)",
                          borderRadius: 9,
                          padding:      10,
                          marginBottom: 8,
                          cursor:       "grab",
                          opacity:      isDragging ? .4 : 1,
                          transition:   "opacity .15s, box-shadow .15s",
                          boxShadow:    isDragging ? "none" : "0 2px 8px rgba(0,0,0,.25)",
                          userSelect:   "none",
                        }}
                      >
                        {/* Linha 1: avatar + nome */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                            background: pal.bg, color: pal.fg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 8, fontWeight: 700,
                          }}>
                            {initials(c.name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontSize: 12, fontWeight: 600, color: "#e8eaf0",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {c.projectName || c.name}
                            </div>
                            <div style={{
                              fontSize: 10, color: "#5a6478",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {c.name}
                            </div>
                          </div>
                        </div>

                        {/* Linha 2: valor + badge */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700, color: "#22c97d", fontFamily: "monospace",
                          }}>
                            {formatCurrency(c.projectValue)}
                          </span>
                          <span style={{
                            fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: ".3px",
                            color: pay.color, background: pay.color + "18",
                            padding: "2px 6px", borderRadius: 4,
                          }}>
                            {pay.label}
                          </span>
                        </div>

                        {/* Linha 3: barra de progresso */}
                        {c.projectProgress !== undefined && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{
                              height: 3, background: "#1c2236", borderRadius: 4, overflow: "hidden",
                            }}>
                              <div style={{
                                height: "100%", borderRadius: 4,
                                width: `${Math.min(100, Math.max(0, c.projectProgress))}%`,
                                background: col.color,
                              }}/>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
          )
        })}
      </div>

      <style>{`@keyframes shimmer { to { background-position: -400% 0; } }`}</style>
    </div>
  )
}