// src/components/finance/NewFinancialRecordModal.jsx
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { supabase } from "../../lib/supabase"

const overlay = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
}
const panel = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { type: "spring", stiffness: 380, damping: 36 } },
}

export default function NewFinancialRecordModal({ onClose, onCreate, addToast }) {
  const [clients,  setClients]  = useState([])
  const [saving,   setSaving]   = useState(false)
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
      .then(({ data }) => setClients(data ?? []))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.client_id || !form.title.trim() || !form.total_amount) {
      addToast?.("Preencha cliente, título e valor total.", "warning")
      return
    }
    setSaving(true)
    try {
      await onCreate(form)
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
          variants={panel}
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          <div className="modal-header">
            <h2 className="modal-title">Novo registro financeiro</h2>
            <button className="modal-close" onClick={onClose}><X size={16} /></button>
          </div>

          <div className="modal-body">
            <div className="field">
              <label className="field-label">Cliente *</label>
              <select
                className="field-select"
                value={form.client_id}
                onChange={e => set("client_id", e.target.value)}
              >
                <option value="">Selecionar cliente…</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.name} — ${c.company}` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Título do serviço *</label>
              <input
                className="field-input"
                placeholder="Ex: Website Institucional"
                value={form.title}
                onChange={e => set("title", e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field-label">Descrição</label>
              <textarea
                className="field-input field-textarea"
                placeholder="Descrição do projeto ou serviço"
                rows={2}
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Valor total *</label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.total_amount}
                  onChange={e => set("total_amount", e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Data início</label>
                <input
                  className="field-input"
                  type="date"
                  value={form.start_date}
                  onChange={e => set("start_date", e.target.value)}
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

            <div className="field">
              <label className="field-label">Notas internas</label>
              <textarea
                className="field-input field-textarea"
                placeholder="Observações internas"
                rows={2}
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <motion.button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {saving ? "Criando…" : "Criar registro"}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style>{css}</style>
    </>
  )
}

const css = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(3px);
    z-index: 400;
  }
  .modal-wrap {
    position: fixed;
    inset: 0;
    z-index: 401;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .modal-panel {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 24px 18px;
    border-bottom: 1px solid var(--border);
  }
  .modal-title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.3px;
  }
  .modal-close {
    width: 30px; height: 30px;
    background: none; border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-secondary);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .modal-close:hover { background: var(--bg-overlay); color: var(--text-primary); }

  .modal-body {
    padding: 20px 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scrollbar-width: thin;
    scrollbar-color: var(--bg-overlay) transparent;
  }
  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .field-row { display: flex; gap: 12px; }
  .field-label {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .field-input, .field-select {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 9px 12px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .field-input:focus, .field-select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }
  .field-input::placeholder { color: var(--text-muted); }
  .field-textarea { resize: vertical; min-height: 60px; }
  .field-select { appearance: none; cursor: pointer; }
  .field-select option { background: var(--bg-elevated); }

  .btn-ghost {
    background: none; border: 1px solid var(--border);
    border-radius: var(--radius-md); padding: 9px 18px;
    font-family: var(--font-body); font-size: 14px;
    color: var(--text-secondary); cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn-ghost:hover { background: var(--bg-overlay); color: var(--text-primary); }
`