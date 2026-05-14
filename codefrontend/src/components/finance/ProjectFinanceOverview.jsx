// src/components/finance/ProjectFinanceOverview.jsx
// Visão financeira de um projeto: cards + barra de progresso + histórico
// Props:
//   finance      — objeto project_finances (null se ainda não configurado)
//   payments     — array de payments do finance
//   loading      — boolean
//   projectName  — string
//   onSetupFinance(payload) — callback para criar finance
//   onUpdateFinance(payload)
//   onNewPayment()
//   onViewPayment(payment)
//   onMarkPaid(id)
//   onEditPayment(payment)
//   onDuplicatePayment(payment)
//   onDeletePayment(id)

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FinanceProgressBar from "./FinanceProgressBar"
import PaymentHistory     from "./PaymentHistory"

// ── helpers ──────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0)

const fmtDate = (d) => {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

const STATUS_CONFIG = {
  pending: { label: "Aguardando",   color: "#f59e0b", bg: "rgba(245,158,11,.1)"  },
  partial: { label: "Em Andamento", color: "#4f6ef7", bg: "rgba(79,110,247,.1)"  },
  paid:    { label: "Quitado",      color: "#22c97d", bg: "rgba(34,201,125,.1)"  },
  overdue: { label: "Em Atraso",    color: "#ef4444", bg: "rgba(239,68,68,.1)"   },
}

// ── Finance Cards ─────────────────────────────────────────────
function FinanceCards({ finance }) {
  const pct   = Number(finance.progress_percentage) || 0
  const cards = [
    {
      label: "Valor Total",
      value: fmt(finance.total_amount),
      sub:   "acordado no contrato",
      color: "#e8eaf0",
      icon:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    },
    {
      label: "Recebido",
      value: fmt(finance.received_amount),
      sub:   `${finance.payments_count ?? "—"} pagamentos`,
      color: "#22c97d",
      icon:  "M20 6L9 17l-5-5",
    },
    {
      label: "Restante",
      value: fmt(finance.remaining_amount),
      sub:   "a receber",
      color: Number(finance.remaining_amount) > 0 ? "#f59e0b" : "#22c97d",
      icon:  "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    },
    {
      label: "Progresso",
      value: `${pct.toFixed(0)}%`,
      sub:   "do valor total pago",
      color: pct >= 100 ? "#22c97d" : pct > 0 ? "#4f6ef7" : "#5a6478",
      icon:  "M18 20V10M12 20V4M6 20v-6",
    },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.25 }}
          style={{
            background: "#111520", border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 12, padding: "16px 18px",
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 10,
          }}>
            <span style={{
              fontSize: 9, color: "#5a6478", fontFamily: "monospace",
              textTransform: "uppercase", letterSpacing: ".6px",
            }}>
              {card.label}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={card.color} strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ opacity: .6 }}>
              <path d={card.icon} />
            </svg>
          </div>
          <div style={{
            fontSize: 20, fontWeight: 700, color: card.color,
            fontFamily: "monospace", letterSpacing: "-.5px", marginBottom: 4,
          }}>
            {card.value}
          </div>
          <div style={{ fontSize: 10, color: "#3a4255", fontFamily: "monospace" }}>
            {card.sub}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Setup Form ────────────────────────────────────────────────
// Protegido contra duplo-submit com ref de lock
function SetupFinanceForm({ projectName, onSetup }) {
  const [total,  setTotal]  = useState("")
  const [type,   setType]   = useState("parcelado")
  const [notes,  setNotes]  = useState("")
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState("")

  // Ref de lock: impede segunda chamada enquanto a primeira está em voo
  const submittingRef = useRef(false)

  const handleSubmit = async () => {
    if (submittingRef.current) return   // já está enviando
    if (!total || Number(total) <= 0) { setError("Informe o valor total do projeto"); return }

    submittingRef.current = true
    setSaving(true)
    setError("")

    try {
      await onSetup({
        total_amount: parseFloat(total),
        payment_type: type,
        notes:        notes.trim() || null,
      })
    } finally {
      submittingRef.current = false
      setSaving(false)
    }
  }

  const inputStyle = {
    width: "100%", background: "#111520",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
    padding: "9px 12px", fontSize: 12, color: "#e8eaf0",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    transition: "border-color .15s",
  }
  const labelStyle = {
    fontSize: 9, color: "#5a6478", fontFamily: "monospace",
    textTransform: "uppercase", letterSpacing: ".6px",
    display: "block", marginBottom: 5,
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }}
      style={{
        background: "#111520", border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 14, padding: "28px 24px", maxWidth: 420,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", marginBottom: 4 }}>
          Configurar Financeiro
        </div>
        <div style={{ fontSize: 11, color: "#5a6478" }}>
          Defina o valor total para acompanhar o progresso financeiro de{" "}
          <strong style={{ color: "#8892a4" }}>{projectName}</strong>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {/* Valor total */}
        <div>
          <label style={labelStyle}>Valor Total do Projeto (R$) *</label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 11, color: "#5a6478", fontFamily: "monospace",
            }}>R$</span>
            <input
              type="number" min="0" step="0.01"
              value={total}
              onChange={(e) => { setTotal(e.target.value); setError("") }}
              placeholder="0,00"
              disabled={saving}
              style={{
                ...inputStyle, paddingLeft: 36,
                borderColor: error ? "#ef4444" : "rgba(255,255,255,.1)",
                opacity: saving ? .6 : 1,
              }}
              onFocus={e => e.target.style.borderColor = "#4f6ef7"}
              onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,.1)"}
            />
          </div>
          {error && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{error}</div>}
        </div>

        {/* Tipo de pagamento */}
        <div>
          <label style={labelStyle}>Tipo de Pagamento</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            disabled={saving}
            style={{ ...inputStyle, cursor: "pointer", appearance: "none", opacity: saving ? .6 : 1 }}
          >
            <option value="parcelado">Parcelado</option>
            <option value="avulso">Avulso / Único</option>
            <option value="recorrente">Recorrente / Mensalidade</option>
            <option value="milestone">Por Entrega (Milestone)</option>
          </select>
        </div>

        {/* Observações */}
        <div>
          <label style={labelStyle}>Observações</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Acordos, condições de pagamento..."
            rows={2}
            disabled={saving}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, opacity: saving ? .6 : 1 }}
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 8,
            fontSize: 12, fontWeight: 600,
            cursor: saving ? "default" : "pointer",
            background: saving ? "rgba(79,110,247,.55)" : "#4f6ef7",
            border: "none", color: "#fff", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background .2s",
          }}
        >
          {saving && (
            <div style={{
              width: 13, height: 13, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,.2)", borderTopColor: "#fff",
              animation: "spin .6s linear infinite",
            }} />
          )}
          {saving ? "Configurando…" : "Configurar Financeiro"}
        </button>
      </div>
    </motion.div>
  )
}

// ── Upcoming Payments ─────────────────────────────────────────
function UpcomingDue({ payments }) {
  const upcoming = payments
    .filter(p =>
      p.status === "pending" || p.status === "overdue" ||
      p.status === "pendente" || p.status === "atrasado"
    )
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
    .slice(0, 4)

  if (!upcoming.length) return null

  return (
    <div style={{
      background: "#111520", border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 12, padding: "14px 18px",
    }}>
      <div style={{
        fontSize: 9, color: "#5a6478", fontFamily: "monospace",
        textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12,
      }}>
        Próximos Vencimentos
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {upcoming.map((p) => {
          const isOverdue = p.status === "overdue" || p.status === "atrasado"
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: isOverdue ? "#ef4444" : "#f59e0b", flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: "#8892a4" }}>{p.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace" }}>
                  {fmtDate(p.due_date)}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily: "monospace",
                  color: isOverdue ? "#ef4444" : "#e8eaf0",
                }}>
                  {fmt(p.amount)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function FinanceSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            height: 88, borderRadius: 12,
            background: "linear-gradient(90deg,#111520 25%,#161b2a 50%,#111520 75%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.4s ease infinite",
          }} />
        ))}
      </div>
      <div style={{
        height: 32, borderRadius: 8,
        background: "linear-gradient(90deg,#111520 25%,#161b2a 50%,#111520 75%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.4s ease infinite",
      }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{
          height: 64, borderRadius: 10,
          background: "linear-gradient(90deg,#111520 25%,#161b2a 50%,#111520 75%)",
          backgroundSize: "400% 100%",
          animation: "shimmer 1.4s ease infinite",
        }} />
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function ProjectFinanceOverview({
  finance,
  payments       = [],
  loading        = false,
  projectName    = "",
  onSetupFinance,
  onUpdateFinance,
  onNewPayment,
  onViewPayment,
  onMarkPaid,
  onEditPayment,
  onDuplicatePayment,
  onDeletePayment,
}) {
  if (loading) return <FinanceSkeleton />

  // Sem financeiro configurado → setup
  if (!finance) {
    return (
      <SetupFinanceForm
        projectName={projectName}
        onSetup={onSetupFinance}
      />
    )
  }

  const statusCfg = STATUS_CONFIG[finance.status] ?? STATUS_CONFIG.pending

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* ── Section header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>Financeiro</span>
          <span style={{
            padding: "2px 8px", borderRadius: 5,
            fontSize: 9, fontWeight: 700, fontFamily: "monospace",
            textTransform: "uppercase", letterSpacing: ".4px",
            background: statusCfg.bg, color: statusCfg.color,
          }}>
            {statusCfg.label}
          </span>
        </div>
        <button
          onClick={onNewPayment}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 16px", borderRadius: 8,
            background: "#4f6ef7", border: "none",
            color: "#fff", fontSize: 12, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(79,110,247,.25)",
          }}
        >
          + Novo Pagamento
        </button>
      </div>

      {/* ── Cards ── */}
      <FinanceCards finance={finance} />

      {/* ── Progress bar ── */}
      <div style={{
        background: "#111520", border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 12, padding: "14px 18px",
      }}>
        <FinanceProgressBar
          progress={finance.progress_percentage}
          status={finance.status}
        />
        {finance.notes && (
          <div style={{ marginTop: 10, fontSize: 11, color: "#3a4255", lineHeight: 1.5 }}>
            {finance.notes}
          </div>
        )}
      </div>

      {/* ── Upcoming ── */}
      <UpcomingDue payments={payments} />

      {/* ── Histórico ── */}
      <div>
        <div style={{
          fontSize: 9, color: "#5a6478", fontFamily: "monospace",
          textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12,
        }}>
          Histórico de Pagamentos
        </div>
        <PaymentHistory
          payments={payments}
          onView={onViewPayment}
          onMarkPaid={onMarkPaid}
          onEdit={onEditPayment}
          onDuplicate={onDuplicatePayment}
          onDelete={onDeletePayment}
        />
      </div>
    </motion.div>
  )
}