// src/components/finance/PaymentItem.jsx
import { useState } from "react"

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)

const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—"

const METHOD_LABELS = {
  pix:         "Pix",
  boleto:      "Boleto",
  credit_card: "Cartão",
  transfer:    "Transferência",
  cash:        "Dinheiro",
}

const STATUS_META = {
  paid:    { color: "#22c97d", dotBg: "rgba(34,201,125,.15)", badge: "green", label: "Pago"    },
  pending: { color: "#8892a4", dotBg: "rgba(90,100,120,.12)", badge: "gray",  label: "Pendente"},
  overdue: { color: "#ef4444", dotBg: "rgba(239,68,68,.15)",  badge: "red",   label: "Atrasado"},
}

const BADGE_COLOR = {
  green: { bg: "rgba(34,201,125,.12)",  color: "#22c97d" },
  amber: { bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  red:   { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  gray:  { bg: "rgba(90,100,120,.15)",  color: "#8892a4" },
}

function Badge({ colorKey, label }) {
  const s = BADGE_COLOR[colorKey] ?? BADGE_COLOR.gray
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px",
      borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: "monospace",
      textTransform: "uppercase", letterSpacing: ".3px", background: s.bg, color: s.color,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {label}
    </span>
  )
}

export default function PaymentItem({ payment, isLast, onMarkPaid, onEdit, onDelete, onDuplicate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)
  const sm = STATUS_META[payment.status] || STATUS_META.pending

  return (
    <div
      style={{ display: "flex", gap: 10, alignItems: "stretch" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
    >
      {/* timeline track */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 14, flexShrink: 0, width: 18,
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%",
          background: sm.dotBg, border: `1px solid ${sm.color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 7, color: sm.color, flexShrink: 0,
        }}>
          {payment.status === "paid" ? "✓" : payment.status === "overdue" ? "!" : "○"}
        </div>
        {!isLast && (
          <div style={{
            width: 1, flex: 1, background: "rgba(255,255,255,.07)",
            margin: "5px 0", minHeight: 16,
          }} />
        )}
      </div>

      {/* body */}
      <div style={{
        flex: 1, background: hovered ? "#1a1f30" : "#161b2a",
        border: "1px solid rgba(255,255,255,.06)", borderRadius: 9,
        padding: "10px 12px", marginBottom: isLast ? 0 : 8,
        opacity: payment.status === "paid" ? .7 : 1,
        transition: "background .12s, opacity .2s",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* title + badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>
                {payment.title}
              </span>
              <Badge colorKey={sm.badge} label={sm.label} />
            </div>

            {/* meta row */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{
                fontSize: 9, fontFamily: "monospace", padding: "1px 5px",
                background: "#1c2236", borderRadius: 3,
                border: "1px solid rgba(255,255,255,.06)", color: "#5a6478",
              }}>
                {METHOD_LABELS[payment.payment_method] || payment.payment_method}
              </span>
              {payment.due_date && (
                <span style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace" }}>
                  venc. {fmtDate(payment.due_date)}
                </span>
              )}
              {payment.paid_at && payment.status === "paid" && (
                <span style={{ fontSize: 10, color: "#22c97d", fontFamily: "monospace" }}>
                  ✓ {fmtDate(payment.paid_at)}
                </span>
              )}
            </div>

            {payment.notes && (
              <p style={{
                fontSize: 11, color: "#5a6478", marginTop: 6, lineHeight: 1.5,
                fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,.05)",
                paddingTop: 6,
              }}>{payment.notes}</p>
            )}
          </div>

          {/* right: amount + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{
              fontSize: 13, fontWeight: 600, color: sm.color,
              fontFamily: "monospace", whiteSpace: "nowrap",
            }}>
              {fmt(payment.amount)}
            </span>

            {/* mark paid */}
            {payment.status !== "paid" && (
              <button
                onClick={onMarkPaid}
                title="Marcar como pago"
                style={{
                  width: 24, height: 24, borderRadius: 5,
                  background: "rgba(34,201,125,.1)", border: "1px solid rgba(34,201,125,.2)",
                  color: "#22c97d", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
                }}
              >✓</button>
            )}

            {/* menu */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                style={{
                  width: 24, height: 24, borderRadius: 5,
                  background: menuOpen ? "#1c2236" : "none",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "#5a6478", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                  opacity: hovered || menuOpen ? 1 : 0, transition: "opacity .15s",
                }}
              >⋯</button>

              {menuOpen && (
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 4px)",
                    background: "#111520", border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 8, padding: 4, zIndex: 300, minWidth: 160,
                    boxShadow: "0 8px 32px rgba(0,0,0,.45)",
                  }}
                >
                  {payment.status !== "paid" && (
                    <MenuItem label="✓ Marcar como pago" onClick={onMarkPaid} />
                  )}
                  <MenuItem label="✎ Editar" onClick={onEdit} />
                  <MenuItem label="⧉ Duplicar" onClick={onDuplicate} />
                  <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "3px 0" }} />
                  <MenuItem label="🗑 Excluir" onClick={onDelete} danger />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuItem({ label, onClick, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        padding: "7px 10px", border: "none",
        background: hov ? "#161b2a" : "none",
        fontFamily: "inherit", fontSize: 12,
        color: danger ? "#ef4444" : hov ? "#e8eaf0" : "#8892a4",
        borderRadius: 5, cursor: "pointer", textAlign: "left",
      }}
    >{label}</button>
  )
}