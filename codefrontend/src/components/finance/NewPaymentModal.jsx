// src/components/finance/NewPaymentModal.jsx
import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

const METHODS = [
  { value: "pix",         label: "Pix" },
  { value: "boleto",      label: "Boleto" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "transfer",    label: "Transferência" },
  { value: "cash",        label: "Dinheiro" },
]

const overlay = { hidden: { opacity: 0 }, show: { opacity: 1 } }
const panel = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 36 } },
}

export default function NewPaymentModal({ payment, onClose, onSave }) {
  const isEdit = !!payment
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title:          payment?.title          ?? "",
    description:    payment?.description    ?? "",
    amount:         payment?.amount         ?? "",
    payment_method: payment?.payment_method ?? "pix",
    status:         payment?.status         ?? "pending",
    due_date:       payment?.due_date       ?? "",
    notes:          payment?.notes          ?? "",
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.amount) return
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <motion.div
        className="modal-overlay"
        variants={overlay}
        initial="hidden"
        animate="show"
        exit="hidden"
        onClick={onClose}
      />

      <div className="modal-wrap">
        <motion.div
          className="modal-panel"
          style={{ maxWidth: 440 }}
          variants={panel}
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          <div className="modal-header">
            <h2 className="modal-title">{isEdit ? "Editar pagamento" : "Novo pagamento"}</h2>
            <button className="modal-close" onClick={onClose}><X size={16} /></button>
          </div>

          <div className="modal-body">
            <div className="field">
              <label className="field-label">Título *</label>
              <input
                className="field-input"
                placeholder="Ex: Entrada, Parcela 1…"
                value={form.title}
                onChange={e => set("title", e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Valor *</label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={e => set("amount", e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">Vencimento</label>
                <input
                  className="field-input"
                  type="date"
                  value={form.due_date}
                  onChange={e => set("due_date", e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Método</label>
                <select
                  className="field-input field-select"
                  value={form.payment_method}
                  onChange={e => set("payment_method", e.target.value)}
                >
                  {METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Status</label>
                <select
                  className="field-input field-select"
                  value={form.status}
                  onChange={e => set("status", e.target.value)}
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Atrasado</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Observações</label>
              <textarea
                className="field-input field-textarea"
                placeholder="Notas sobre este pagamento"
                rows={2}
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
            <motion.button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={saving || !form.title.trim() || !form.amount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {saving ? "Salvando…" : isEdit ? "Salvar" : "Criar pagamento"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  )
}