// src/components/finance/PaymentItem.jsx
import { motion } from "framer-motion"
import PaymentActionsDropdown from "./PaymentActionsDropdown"

const fmt = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0)

const fmtDate = (d) => {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

const METHOD_LABEL = {
  pix: "Pix", boleto: "Boleto", cartao: "Cartão",
  transferencia: "Transferência", dinheiro: "Dinheiro",
  credit_card: "Cartão", bank_transfer: "Transferência",
}

const STATUS_CONFIG = {
  paid:     { label: "Pago",     color: "#22c97d", bg: "rgba(34,201,125,.1)",  dot: "#22c97d"  },
  pending:  { label: "Pendente", color: "#f59e0b", bg: "rgba(245,158,11,.1)", dot: "#f59e0b"  },
  overdue:  { label: "Atrasado", color: "#ef4444", bg: "rgba(239,68,68,.1)",  dot: "#ef4444"  },
  // PT aliases
  pago:     { label: "Pago",     color: "#22c97d", bg: "rgba(34,201,125,.1)",  dot: "#22c97d"  },
  pendente: { label: "Pendente", color: "#f59e0b", bg: "rgba(245,158,11,.1)", dot: "#f59e0b"  },
  atrasado: { label: "Atrasado", color: "#ef4444", bg: "rgba(239,68,68,.1)",  dot: "#ef4444"  },
}

export default function PaymentItem({
  payment,
  index = 0,
  isLast = false,
  onView,
  onMarkPaid,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending
  const isPaid = payment.status === "paid" || payment.status === "pago"

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      style={{ display: "flex", gap: 0, position: "relative" }}
    >
      {/* Timeline line + dot */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        width: 28, flexShrink: 0, paddingTop: 2,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
          background: isPaid ? cfg.dot : "transparent",
          border: `2px solid ${cfg.dot}`,
          boxShadow: isPaid ? `0 0 6px ${cfg.dot}88` : "none",
          transition: "all .3s",
        }} />
        {!isLast && (
          <div style={{
            width: 1, flex: 1, minHeight: 16,
            background: "rgba(255,255,255,.06)", marginTop: 4,
          }} />
        )}
      </div>

      {/* Card */}
      <div
        onClick={() => onView(payment)}
        style={{
          flex: 1, marginBottom: isLast ? 0 : 8, marginLeft: 8,
          background: "#111520", border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 10, padding: "11px 14px",
          cursor: "pointer", transition: "border-color .15s, background .15s",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"
          e.currentTarget.style.background  = "#141925"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"
          e.currentTarget.style.background  = "#111520"
        }}
      >
        {/* Left: title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 12, fontWeight: 500, color: "#e8eaf0",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {payment.title}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "1px 7px", borderRadius: 4,
              fontSize: 9, fontWeight: 700, fontFamily: "monospace",
              textTransform: "uppercase", letterSpacing: ".3px",
              background: cfg.bg, color: cfg.color, flexShrink: 0,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: cfg.dot }} />
              {cfg.label}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace" }}>
              Venc. {fmtDate(payment.due_date)}
            </span>
            {payment.paid_at && (
              <span style={{ fontSize: 10, color: "#22c97d66", fontFamily: "monospace" }}>
                Pago {fmtDate(payment.paid_at)}
              </span>
            )}
            {payment.payment_method && (
              <span style={{ fontSize: 10, color: "#3a4255", fontFamily: "monospace" }}>
                {METHOD_LABEL[payment.payment_method] ?? payment.payment_method}
              </span>
            )}
          </div>
          {payment.notes && (
            <div style={{
              marginTop: 5, fontSize: 10, color: "#3a4255",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              maxWidth: 260,
            }}>
              {payment.notes}
            </div>
          )}
        </div>

        {/* Right: amount + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{
            fontSize: 14, fontWeight: 700, fontFamily: "monospace",
            color: isPaid ? "#22c97d" : "#e8eaf0", letterSpacing: "-.3px",
          }}>
            {fmt(payment.amount)}
          </span>
          <div onClick={e => e.stopPropagation()}>
            <PaymentActionsDropdown
              payment={payment}
              onView={() => onView(payment)}
              onMarkPaid={() => onMarkPaid(payment.id)}
              onEdit={() => onEdit(payment)}
              onDuplicate={() => onDuplicate(payment)}
              onDelete={() => onDelete(payment.id)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}