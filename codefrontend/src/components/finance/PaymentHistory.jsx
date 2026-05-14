// src/components/finance/PaymentHistory.jsx
import { AnimatePresence, motion } from "framer-motion"
import PaymentItem from "./PaymentItem"

export default function PaymentHistory({
  payments = [],
  loading  = false,
  onView,
  onMarkPaid,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            height: 62, borderRadius: 10,
            background: "linear-gradient(90deg,#111520 25%,#161b2a 50%,#111520 75%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.4s ease infinite",
          }} />
        ))}
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{
          padding: "40px 0", textAlign: "center",
          border: "1px dashed rgba(255,255,255,.07)", borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
        <div style={{ fontSize: 13, color: "#5a6478", fontWeight: 500 }}>Nenhum pagamento ainda</div>
        <div style={{ fontSize: 11, color: "#3a4255", marginTop: 4 }}>
          Clique em "Novo Pagamento" para registrar uma parcela
        </div>
      </motion.div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <AnimatePresence>
        {payments.map((p, i) => (
          <PaymentItem
            key={p.id}
            payment={p}
            index={i}
            isLast={i === payments.length - 1}
            onView={onView}
            onMarkPaid={onMarkPaid}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}