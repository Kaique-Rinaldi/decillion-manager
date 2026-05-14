// src/components/finance/PaymentTimeline.jsx
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PaymentItem from "./PaymentItem"
import NewPaymentModal from "./NewPaymentModal"

export default function PaymentTimeline({
  payments, loading,
  onAdd, onEdit, onMarkPaid, onDelete, onDuplicate,
  addToast,
}) {
  const [modalOpen,      setModalOpen]      = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)

  const handleAdd = async (form) => {
    await onAdd(form)
    setModalOpen(false)
  }

  const handleEdit = async (id, form) => {
    await onEdit(id, form)
    setEditingPayment(null)
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            height: 58, borderRadius: 9,
            background: "linear-gradient(90deg, #1c2236 25%, #252d42 50%, #1c2236 75%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.4s ease infinite",
          }} />
        ))}
        <style>{`@keyframes shimmer { to { background-position: -400% 0; } }`}</style>
      </div>
    )
  }

  return (
    <>
      {/* header row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <span style={{ fontSize: 11, color: "#5a6478", fontFamily: "monospace" }}>
          {payments.length} {payments.length === 1 ? "pagamento" : "pagamentos"}
        </span>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 7,
            background: "rgba(79,110,247,.1)", border: "1px solid rgba(79,110,247,.2)",
            color: "#4f6ef7", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
          }}
        >+ Novo pagamento</button>
      </div>

      {payments.length === 0 ? (
        <div style={{
          border: "1px dashed rgba(255,255,255,.07)", borderRadius: 9,
          padding: "32px 16px", textAlign: "center",
          color: "#3a4255", fontSize: 13,
        }}>
          Nenhum pagamento ainda. Adicione o primeiro para começar.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="popLayout">
            {payments.map((payment, i) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.25 } }}
                exit={{ opacity: 0, scale: .96 }}
                layout
              >
                <PaymentItem
                  payment={payment}
                  isLast={i === payments.length - 1}
                  onMarkPaid={() => onMarkPaid(payment.id)}
                  onEdit={() => setEditingPayment(payment)}
                  onDelete={() => onDelete(payment.id)}
                  onDuplicate={() => onDuplicate(payment)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <NewPaymentModal
            onClose={() => setModalOpen(false)}
            onSave={handleAdd}
          />
        )}
        {editingPayment && (
          <NewPaymentModal
            payment={editingPayment}
            onClose={() => setEditingPayment(null)}
            onSave={(form) => handleEdit(editingPayment.id, form)}
          />
        )}
      </AnimatePresence>
    </>
  )
}