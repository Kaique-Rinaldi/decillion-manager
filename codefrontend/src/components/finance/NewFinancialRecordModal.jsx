// src/components/finance/NewFinancialRecordModal.jsx
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../../lib/supabase"

export default function NewFinancialRecordModal({ onClose, onCreate, addToast }) {
  const [clients, setClients] = useState([])
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState({})
  const [form, setForm] = useState({
    client_id:    "",
    title:        "",
    description:  "",
    total_amount: "",
    start_date:   "",
    due_date:     "",
    notes:        "",
  })

  useEffect(() => {
    supabase
      .from("clients")
      .select("id, name, company")
      .order("name")
      .then(({ data, error }) => {
        if (!error) setClients(data ?? [])
      })
  }, [])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.client_id)       e.client_id    = "Selecione um cliente"
    if (!form.title?.trim())   e.title        = "Título obrigatório"
    if (!form.total_amount || Number(form.total_amount) <= 0)
                               e.total_amount = "Valor deve ser > 0"
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onCreate({
        ...form,
        total_amount: Number(form.total_amount),
      })
    } catch {
      // error toasted by useFinance
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = (err) => ({
    background: "#161b2a",
    border: `1px solid ${err ? "#ef4444" : "rgba(255,255,255,.15)"}`,
    borderRadius: 7, padding: "7px 10px", fontSize: 12, color: "#e8eaf0",
    fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box",
    transition: "border-color .15s",
  })

  const labelStyle = {
    fontSize: 9, color: "#5a6478", fontFamily: "monospace",
    textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5, display: "block",
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
        zIndex: 1500, display: "flex", alignItems: "center", justifyContent: "center",
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
          borderRadius: 16, width: "100%", maxWidth: 560,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,.5)",
        }}
      >
        {/* header */}
        <div style={{
          padding: "20px 24px 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0" }}>
            ➕ Novo registro financeiro
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 7, color: "#8892a4", cursor: "pointer",
              width: 30, height: 30, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18,
            }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ padding: "20px 24px 24px" }}>

          {/* section: contato */}
          <div style={{
            fontSize: 9, color: "#5a6478", textTransform: "uppercase",
            letterSpacing: ".7px", fontFamily: "monospace", marginBottom: 10,
            paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,.06)",
          }}>Dados do registro</div>

          <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>

            {/* client */}
            <div>
              <label style={labelStyle}>Cliente *</label>
              <select
                value={form.client_id}
                onChange={e => set("client_id", e.target.value)}
                style={{ ...inputStyle(errors.client_id), cursor: "pointer", appearance: "none" }}
              >
                <option value="">Selecionar cliente…</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.name} — ${c.company}` : c.name}
                  </option>
                ))}
              </select>
              {errors.client_id && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{errors.client_id}</div>}
            </div>

            {/* title */}
            <div>
              <label style={labelStyle}>Título do serviço *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="Ex: Website Institucional"
                style={inputStyle(errors.title)}
              />
              {errors.title && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{errors.title}</div>}
            </div>

            {/* description */}
            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Descrição do projeto ou serviço"
                rows={2}
                style={{ ...inputStyle(false), resize: "vertical", minHeight: 60 }}
              />
            </div>

            {/* value */}
            <div>
              <label style={labelStyle}>Valor total (R$) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.total_amount}
                onChange={e => set("total_amount", e.target.value)}
                placeholder="0,00"
                style={inputStyle(errors.total_amount)}
              />
              {errors.total_amount && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{errors.total_amount}</div>}
            </div>

            {/* dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Data início</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => set("start_date", e.target.value)}
                  style={{ ...inputStyle(false), colorScheme: "dark" }}
                />
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

            {/* notes */}
            <div>
              <label style={labelStyle}>Notas internas</label>
              <textarea
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                placeholder="Observações internas"
                rows={2}
                style={{ ...inputStyle(false), resize: "vertical", minHeight: 60 }}
              />
            </div>
          </div>

          {/* actions */}
          <div style={{
            display: "flex", gap: 8, justifyContent: "flex-end",
            paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)",
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "7px 16px", borderRadius: 7,
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
                color: "#8892a4", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}
            >Cancelar</button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "7px 16px", borderRadius: 7, background: "#4f6ef7",
                border: "none", color: "#fff", fontSize: 12, fontWeight: 500,
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6, opacity: saving ? .7 : 1,
              }}
            >
              {saving && (
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
                  animation: "spin .6s linear infinite",
                }} />
              )}
              {saving ? "Criando…" : "Criar registro"}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  )
}