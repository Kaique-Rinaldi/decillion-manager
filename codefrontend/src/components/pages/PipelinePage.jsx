import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../../lib/supabase"
import { fetchDeals, createDeal, updateDeal } from "../../services/dealsService"

// ─── Colunas do pipeline ──────────────────────────────────────────────────────
const STAGES = {
  lead:       { label: "Lead",        color: "#60a5fa" },
  contactado: { label: "Contactado",  color: "#a78bfa" },
  proposta:   { label: "Proposta",    color: "#f59e0b" },
  negociacao: { label: "Negociação",  color: "#ec4899" },
  fechado:    { label: "Fechado",     color: "#22c97d" },
}
const STAGE_KEYS = ["lead", "contactado", "proposta", "negociacao", "fechado"]

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

// ─── Modal para criar deal ────────────────────────────────────────────────────
function CreateDealModal({ onClose, onSave }) {
  const [form, setForm]     = useState({ name: "", company: "", value: "", stage: "lead" })
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await onSave({ ...form, value: Number(form.value) || 0 })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 7, padding: "8px 10px",
    fontSize: 12, color: "#e8eaf0", fontFamily: "monospace",
    outline: "none", marginBottom: 10,
  }
  const labelStyle = {
    fontSize: 9, color: "#5a6478", fontFamily: "monospace",
    textTransform: "uppercase", letterSpacing: ".7px",
    display: "block", marginBottom: 4,
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: .96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .96, y: 8 }}
        style={{
          background: "#111520", border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 14, padding: 24, width: 360,
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", fontFamily: "monospace" }}>
            Novo deal
          </span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#5a6478",
            cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1,
          }}>✕</button>
        </div>

        <label style={labelStyle}>Nome / contato *</label>
        <input
          style={inputStyle}
          placeholder="Ex: João Silva"
          value={form.name}
          onChange={e => set("name", e.target.value)}
          onFocus={e  => e.target.style.borderColor = "rgba(96,165,250,.5)"}
          onBlur={e   => e.target.style.borderColor = "rgba(255,255,255,.09)"}
        />

        <label style={labelStyle}>Empresa</label>
        <input
          style={inputStyle}
          placeholder="Ex: Acme Ltda"
          value={form.company}
          onChange={e => set("company", e.target.value)}
          onFocus={e  => e.target.style.borderColor = "rgba(96,165,250,.5)"}
          onBlur={e   => e.target.style.borderColor = "rgba(255,255,255,.09)"}
        />

        <label style={labelStyle}>Valor (R$)</label>
        <input
          style={inputStyle}
          placeholder="0"
          type="number"
          min="0"
          value={form.value}
          onChange={e => set("value", e.target.value)}
          onFocus={e  => e.target.style.borderColor = "rgba(96,165,250,.5)"}
          onBlur={e   => e.target.style.borderColor = "rgba(255,255,255,.09)"}
        />

        <label style={labelStyle}>Etapa inicial</label>
        <select
          style={{ ...inputStyle, marginBottom: 20, cursor: "pointer" }}
          value={form.stage}
          onChange={e => set("stage", e.target.value)}
        >
          {STAGE_KEYS.map(k => (
            <option key={k} value={k}>{STAGES[k].label}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)", borderRadius: 8,
            padding: "9px 0", fontSize: 12, color: "#5a6478",
            fontFamily: "monospace", cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            style={{
              flex: 1,
              background: !form.name.trim() || saving ? "rgba(96,165,250,.1)" : "rgba(96,165,250,.18)",
              border: "1px solid rgba(96,165,250,.3)", borderRadius: 8,
              padding: "9px 0", fontSize: 12, fontWeight: 600,
              color: !form.name.trim() || saving ? "#4a6a9a" : "#60a5fa",
              fontFamily: "monospace",
              cursor: !form.name.trim() || saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Salvando..." : "Criar deal"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PipelinePage({ addToast }) {
  const [deals,      setDeals]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [draggingId, setDraggingId] = useState(null)
  const [overStage,  setOverStage]  = useState(null)
  const [showModal,  setShowModal]  = useState(false)
  const userIdRef = useRef(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      userIdRef.current = user.id
      const data = await fetchDeals(user.id)
      setDeals(data)
    } finally {
      setLoading(false)
    }
  }

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  function onDragStart(e, id) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
  }
  function onDragOver(e, stage) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setOverStage(stage)
  }
  function onDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOverStage(null)
  }
  function onDragEnd() {
    setDraggingId(null)
    setOverStage(null)
  }
  async function onDrop(e, targetStage) {
    e.preventDefault()
    setOverStage(null)

    const id = draggingId ?? e.dataTransfer.getData("text/plain")
    if (!id) return

    const deal = deals.find(d => d.id === id)
    if (!deal || deal.stage === targetStage) { setDraggingId(null); return }

    // Optimistic update
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage: targetStage } : d))
    setDraggingId(null)

    try {
      await updateDeal(deal.id, { stage: targetStage })
      addToast?.(`Movido para "${STAGES[targetStage].label}"`, "success")
    } catch (err) {
      console.error(err)
      addToast?.("Erro ao mover deal", "error")
      setDeals(prev => prev.map(d => d.id === deal.id ? deal : d))
    }
  }

  // ── Criar deal ──────────────────────────────────────────────────────────────
  async function handleCreate(formData) {
    const userId = userIdRef.current
    if (!userId) return
    try {
      const newDeal = await createDeal(userId, formData)
      setDeals(prev => [newDeal, ...prev])
      addToast?.("Deal criado!", "success")
    } catch (err) {
      console.error(err)
      addToast?.("Erro ao criar deal", "error")
    }
  }

  // ── Totais ──────────────────────────────────────────────────────────────────
  const totalValue = deals.reduce((s, d) => s + d.value, 0)
  const totalFechado = deals.filter(d => d.stage === "fechado").reduce((s, d) => s + d.value, 0)

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Pipeline total", value: formatCurrency(totalValue),   color: "#60a5fa" },
            { label: "Fechado",        value: formatCurrency(totalFechado),  color: "#22c97d" },
            { label: "Deals",          value: deals.length,                  color: "#a78bfa" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "#111520", border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 10, padding: "8px 14px",
            }}>
              <div style={{ fontSize: 9, color, fontFamily: "monospace",
                textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0", fontFamily: "monospace" }}>
                {loading ? "—" : value}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.3)",
            borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600,
            color: "#60a5fa", fontFamily: "monospace", cursor: "pointer",
          }}
        >
          + Novo deal
        </button>
      </div>

      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
        {STAGE_KEYS.map(stageKey => {
          const stage     = STAGES[stageKey]
          const stageDeals = deals.filter(d => d.stage === stageKey)
          const isOver    = overStage === stageKey
          const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0)

          return (
            <div
              key={stageKey}
              onDragOver={e  => onDragOver(e, stageKey)}
              onDragLeave={e => onDragLeave(e)}
              onDrop={e      => onDrop(e, stageKey)}
              style={{
                background:   isOver ? stage.color + "0d" : "#111520",
                border:       `1px solid ${isOver ? stage.color + "60" : "rgba(255,255,255,.06)"}`,
                borderRadius: 12, padding: 12, minHeight: 200,
                transition:   "all .15s",
              }}
            >
              {/* Header da coluna */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: stage.color, flexShrink: 0,
                  }}/>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "#e8eaf0",
                    textTransform: "uppercase", letterSpacing: ".5px", fontFamily: "monospace",
                  }}>
                    {stage.label}
                  </span>
                </div>
                <span style={{
                  fontSize: 9, padding: "1px 6px", borderRadius: 4, fontFamily: "monospace",
                  background: stage.color + "18", color: stage.color,
                }}>
                  {stageDeals.length}
                </span>
              </div>

              {/* Total da coluna */}
              <div style={{
                fontSize: 10, color: "#5a6478", fontFamily: "monospace",
                marginBottom: 10,
              }}>
                {formatCurrency(stageTotal)}
              </div>

              {/* Cards */}
              {loading ? (
                [1,2].map(i => (
                  <div key={i} style={{
                    height: 64, borderRadius: 8, marginBottom: 8,
                    background: "linear-gradient(90deg,#1c2236 25%,#252d42 50%,#1c2236 75%)",
                    backgroundSize: "400% 100%", animation: "shimmer 1.4s ease infinite",
                  }}/>
                ))
              ) : stageDeals.length === 0 ? (
                <div style={{
                  border: "1px dashed rgba(255,255,255,.07)", borderRadius: 8,
                  padding: "16px 10px", textAlign: "center",
                  color: "#3a4255", fontSize: 10, fontFamily: "monospace",
                }}>
                  Arraste aqui
                </div>
              ) : (
                <AnimatePresence>
                  {stageDeals.map(d => {
                    const pal        = avatarColor(d.name)
                    const isDragging = draggingId === d.id
                    return (
                      <motion.div
                        key={d.id}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: .95 }}
                        draggable
                        onDragStart={e => onDragStart(e, d.id)}
                        onDragEnd={onDragEnd}
                        style={{
                          background:   "#161b2a",
                          border:       "1px solid rgba(255,255,255,.07)",
                          borderRadius: 9, padding: 10, marginBottom: 8,
                          cursor:       "grab",
                          opacity:      isDragging ? .4 : 1,
                          transition:   "opacity .15s, box-shadow .15s",
                          boxShadow:    isDragging ? "none" : "0 2px 8px rgba(0,0,0,.25)",
                          userSelect:   "none",
                        }}
                      >
                        {/* Avatar + nome */}
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                            background: pal.bg, color: pal.fg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 8, fontWeight: 700,
                          }}>
                            {initials(d.name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontSize: 11, fontWeight: 600, color: "#e8eaf0",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {d.name}
                            </div>
                            {d.company && (
                              <div style={{
                                fontSize: 9, color: "#5a6478",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {d.company}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Valor */}
                        <div style={{
                          fontSize: 11, fontWeight: 700,
                          color: stageKey === "fechado" ? "#22c97d" : "#e8eaf0",
                          fontFamily: "monospace",
                        }}>
                          {formatCurrency(d.value)}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateDealModal
            onClose={() => setShowModal(false)}
            onSave={handleCreate}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmer { to { background-position: -400% 0; } }`}</style>
    </div>
  )
}