// src/components/finance/NewPaymentModal.jsx
import { useState } from "react"
import { motion } from "framer-motion"

const METHODS = [
  { value: "pix",         label: "Pix" },
  { value: "boleto",      label: "Boleto" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "transfer",    label: "Transferência" },
  { value: "cash",        label: "Dinheiro" },
]

export default function NewPaymentModal({ payment, onClose, onSave }) {
  const isEdit = !!payment
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    title:          payment?.title          ?? "",
    description:    payment?.description    ?? "",
    amount:         payment?.amount         ?? "",
    payment_method: payment?.payment_method ?? "pix",
    status:         payment?.status         ?? "pending",
    due_date:       payment?.due_date       ?? "",
    notes:          payment?.notes          ?? "",
  })

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: "" }))
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (!form.title?.trim()) e.title  = "Título obrigatório"
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Valor deve ser > 0"
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try { await onSave(form) }
    finally { setSaving(false) }
  }

  const inputStyle = (err) => ({
    background: "#161b2a",
    border: `1px solid ${err ? "#ef4444" : "rgba(255,255,255,.15)"}`,
    borderRadius: 7, padding: "7px 10px", fontSize: 12, color: "#e8eaf0",
    fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box",
  })

  const labelStyle = {
    fontSize: 9, color: "#5a6478", fontFamily: "monospace",
    textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5, display: "block",
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
        zIndex: 1600, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: .93, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .93, opacity: 0 }}
        transition={{ duration: .18 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#111520", border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 16, width: "100%", maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,.5)", overflow: "hidden",
        }}
      >
        {/* header */}
        <div style={{
          padding: "18px 22px 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0" }}>
            {isEdit ? "✏️ Editar pagamento" : "➕ Novo pagamento"}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 7, color: "#8892a4", cursor: "pointer",
              width: 28, height: 28, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16,
            }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ padding: "16px 22px 22px" }}>
          <div style={{ display: "grid", gap: 10 }}>

            <div>
              <label style={labelStyle}>Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="Ex: Entrada, Parcela 1…"
                style={inputStyle(errors.title)}
              />
              {errors.title && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{errors.title}</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Valor (R$) *</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.amount}
                  onChange={e => set("amount", e.target.value)}
                  placeholder="0,00"
                  style={inputStyle(errors.amount)}
                />
                {errors.amount && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{errors.amount}</div>}
              </div>
              <div>
                <label style={labelStyle}>Vencimento</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => set("due_date", e.target.value)}
                  style={{ ...inputStyle(false), colorScheme: "dark" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Método</label>
                <select
                  value={form.payment_method}
                  onChange={e => set("payment_method", e.target.value)}
                  style={{ ...inputStyle(false), cursor: "pointer", appearance: "none" }}
                >
                  {METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={e => set("status", e.target.value)}
                  style={{ ...inputStyle(false), cursor: "pointer", appearance: "none" }}
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Atrasado</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Observações</label>
              <textarea
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                placeholder="Notas sobre este pagamento"
                rows={2}
                style={{ ...inputStyle(false), resize: "vertical", minHeight: 52 }}
              />
            </div>
          </div>

          <div style={{
            display: "flex", gap: 8, justifyContent: "flex-end",
            paddingTop: 14, marginTop: 4,
            borderTop: "1px solid rgba(255,255,255,.06)",
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "7px 14px", borderRadius: 7,
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
                color: "#8892a4", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}
            >Cancelar</button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "7px 14px", borderRadius: 7, background: "#4f6ef7",
                border: "none", color: "#fff", fontSize: 12, fontWeight: 500,
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6, opacity: saving ? .7 : 1,
              }}
            >
              {saving && (
                <div style={{
                  width: 11, height: 11, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
                  animation: "spin .6s linear infinite",
                }} />
              )}
              {saving ? "Salvando…" : isEdit ? "Salvar" : "Criar pagamento"}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  )
}