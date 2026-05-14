// src/components/finance/PaymentTimeline.jsx
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import PaymentItem from "./PaymentItem"
import NewPaymentModal from "./NewPaymentModal"

export default function PaymentTimeline({
  payments, loading,
  onAdd, onEdit, onMarkPaid, onDelete, onDuplicate,
  addToast,
}) {
  const [modalOpen, setModalOpen] = useState(false)
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
      <div className="timeline-loading">
        {[1,2,3].map(i => <div key={i} className="skeleton skeleton--timeline-item" />)}
        <style>{`
          .timeline-loading { display: flex; flex-direction: column; gap: 10px; }
          .skeleton--timeline-item { height: 60px; border-radius: var(--radius-md); width: 100%; }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <div className="timeline">
        {/* Header */}
        <div className="timeline-header">
          <p className="timeline-count">
            {payments.length} {payments.length === 1 ? "pagamento" : "pagamentos"}
          </p>
          <motion.button
            className="btn-add-payment"
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={14} /> Novo pagamento
          </motion.button>
        </div>

        {/* Items */}
        {payments.length === 0 ? (
          <div className="timeline-empty">
            <p>Nenhum pagamento ainda.</p>
            <p>Adicione o primeiro para começar o acompanhamento.</p>
          </div>
        ) : (
          <div className="timeline-list">
            <AnimatePresence mode="popLayout">
              {payments.map((payment, i) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.3 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
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
      </div>

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

      <style>{css}</style>
    </>
  )
}

const css = `
  .timeline { display: flex; flex-direction: column; }

  .timeline-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .timeline-count {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
    font-weight: 400;
  }

  .btn-add-payment {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-dim);
    color: var(--accent);
    border: 1px solid rgba(108,99,255,0.25);
    border-radius: var(--radius-sm);
    padding: 7px 14px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .btn-add-payment:hover {
    background: rgba(108,99,255,0.22);
    box-shadow: 0 0 16px var(--accent-glow);
  }

  .timeline-empty {
    text-align: center;
    padding: 40px 0;
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.8;
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
`