// src/components/finance/FinanceDrawer.jsx
import { useState } from "react"
import { motion } from "framer-motion"
import FinanceProgressBar from "./FinanceProgressBar"
import PaymentTimeline from "./PaymentTimeline"
import { usePayments } from "../../hooks/usePayments"

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)

const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—"

const BADGE_COLOR = {
  green:  { bg: "rgba(34,201,125,.12)",  color: "#22c97d" },
  amber:  { bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  red:    { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  blue:   { bg: "rgba(79,110,247,.12)",  color: "#4f6ef7" },
  gray:   { bg: "rgba(90,100,120,.15)",  color: "#8892a4" },
}

const STATUS = {
  pending: { label: "Pendente",  badge: "amber" },
  partial: { label: "Parcial",   badge: "blue"  },
  paid:    { label: "Pago",      badge: "green" },
  overdue: { label: "Atrasado",  badge: "red"   },
}

function Badge({ colorKey, label }) {
  const s = BADGE_COLOR[colorKey] ?? BADGE_COLOR.gray
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px",
      borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: "monospace",
      textTransform: "uppercase", letterSpacing: ".3px", background: s.bg, color: s.color,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {label}
    </span>
  )
}

function initials(name = "") {
  return name.trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()
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

const TABS = ["Pagamentos", "Resumo", "Notas"]

export default function FinanceDrawer({ record, onClose, onRecordUpdated, onDelete, addToast }) {
  const [activeTab, setActiveTab] = useState("Pagamentos")

  const { payments, loading: paymentsLoading, addPayment, editPayment, markPaid, removePayment, dupPayment } =
    usePayments(record.id, onRecordUpdated, addToast)

  const st = STATUS[record.status] || STATUS.pending
  const pal = avatarColor(record.clients?.name || "")
  const clientName = record.clients?.name || "Cliente"
  const pct = record.total_amount > 0
    ? Math.round((record.received_amount / record.total_amount) * 100)
    : 0

  const barColor = {
    paid:    "#22c97d",
    overdue: "#ef4444",
    partial: "#4f6ef7",
    pending: "#f59e0b",
  }[record.status] || "#4f6ef7"

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(3px)", zIndex: 1400,
        }}
      />

      {/* Panel — mirrors ClientDetailModal width/style */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 38 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 480,
          maxWidth: "100vw", background: "#111520",
          borderLeft: "1px solid rgba(255,255,255,.08)",
          zIndex: 1401, display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11, background: pal.bg, color: pal.fg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>
            {initials(clientName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0" }}>
              {record.title}
            </div>
            <div style={{ fontSize: 11, color: "#5a6478", marginTop: 1 }}>
              {record.clients?.company || clientName}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            <Badge colorKey={st.badge} label={st.label} />
            <button
              onClick={() => onDelete(record.id)}
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)",
                color: "#ef4444", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              }}
              title="Excluir registro"
            >×</button>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                color: "#8892a4", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}
            >×</button>
          </div>
        </div>

        {/* Summary amounts */}
        <div style={{
          padding: "14px 24px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          background: "#0f1320", flexShrink: 0,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[
              { l: "Total",    v: fmt(record.total_amount),    c: "#e8eaf0" },
              { l: "Recebido", v: fmt(record.received_amount), c: "#22c97d" },
              { l: "Restante", v: fmt(record.remaining_amount),c: "#f59e0b" },
            ].map(f => (
              <div key={f.l} style={{
                background: "#111520", borderRadius: 9, padding: "10px 12px",
                border: "1px solid rgba(255,255,255,.06)",
              }}>
                <div style={{
                  fontSize: 9, color: "#5a6478", fontFamily: "monospace",
                  textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4,
                }}>{f.l}</div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: f.c, fontFamily: "monospace",
                }}>{f.v}</div>
              </div>
            ))}
          </div>
          <FinanceProgressBar value={pct} color={barColor} height={5} />
          <div style={{
            fontSize: 10, color: "#5a6478", fontFamily: "monospace",
            marginTop: 5, textAlign: "right",
          }}>{pct}% recebido</div>
        </div>

        {/* Tabs — mirrors ClientDetailModal */}
        <div style={{
          display: "flex", gap: 0, padding: "0 24px",
          borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0,
        }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "10px 14px", fontSize: 12, border: "none", background: "none",
                cursor: "pointer", fontFamily: "inherit",
                color: activeTab === t ? "#e8eaf0" : "#5a6478",
                borderBottom: activeTab === t ? "2px solid #4f6ef7" : "2px solid transparent",
                transition: "all .13s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeTab === "Pagamentos" && (
            <PaymentTimeline
              payments={payments}
              loading={paymentsLoading}
              onAdd={addPayment}
              onEdit={editPayment}
              onMarkPaid={markPaid}
              onDelete={removePayment}
              onDuplicate={dupPayment}
              addToast={addToast}
            />
          )}

          {activeTab === "Resumo" && (
            <div>
              {record.description ? (
                <p style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.7, marginBottom: 20 }}>
                  {record.description}
                </p>
              ) : (
                <p style={{ fontSize: 13, color: "#3a4255", fontStyle: "italic", marginBottom: 20 }}>
                  Sem descrição.
                </p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { l: "Início",     v: fmtDate(record.start_date) },
                  { l: "Vencimento", v: fmtDate(record.due_date) },
                  { l: "Criado em",  v: new Date(record.created_at).toLocaleDateString("pt-BR") },
                  { l: "ID",         v: record.id?.slice(0,12) + "…" },
                ].map(f => (
                  <div key={f.l} style={{
                    background: "#161b2a", borderRadius: 9, padding: "10px 14px",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}>
                    <div style={{
                      fontSize: 9, color: "#5a6478", fontFamily: "monospace",
                      textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4,
                    }}>{f.l}</div>
                    <div style={{ fontSize: 12, color: "#e8eaf0", fontFamily: "monospace" }}>{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Notas" && (
            <div>
              {record.notes ? (
                <div style={{
                  background: "#161b2a", borderRadius: 9, padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,.06)",
                  fontSize: 13, color: "#8892a4", lineHeight: 1.7,
                }}>
                  {record.notes}
                </div>
              ) : (
                <div style={{
                  background: "#161b2a", borderRadius: 9, padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,.06)",
                  fontSize: 13, color: "#3a4255", fontStyle: "italic",
                }}>
                  Nenhuma nota adicionada.
                </div>
              )}
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}