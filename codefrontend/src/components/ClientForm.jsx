import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { validateClientForm } from '../../utils/helpers'

// ─── Default empty form ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', email: '', phone: '', company: '',
  projectValue: '',
  paymentStatus: '', projectStatus: '',
  startDate: '', endDate: '', notes: '',
}

// ─── ClientForm ───────────────────────────────────────────────────────────────
// Modal de criar / editar cliente.
// Props:
//   client     → se fornecido, entra em modo edição
//   onSave     → callback(data) chamado ao salvar
//   onClose    → fecha o modal
export default function ClientForm({ client, onSave, onClose, loading }) {
  const isEdit = Boolean(client)
  const [form, setForm] = useState(isEdit ? { ...client } : { ...EMPTY_FORM })
  const [errors, setErrors] = useState({})

  // Se mudar o cliente (troca edição), recarrega o form
  useEffect(() => {
    setForm(isEdit ? { ...client } : { ...EMPTY_FORM })
    setErrors({})
  }, [client])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    // Limpa erro do campo ao digitar
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const { errors: errs, isValid } = validateClientForm(form)
    if (!isValid) { setErrors(errs); return }
    onSave({
      ...form,
      projectValue: Number(form.projectValue),
    })
  }

  // ── Field helpers ────────────────────────────────────────────────────────
  const F = ({ name, label, required, type = 'text', placeholder, full, children }) => (
    <div className={`form-group${full ? ' full' : ''}`}>
      <label className="form-label" htmlFor={`cf-${name}`}>
        {label} {required && <span className="required">*</span>}
      </label>
      {children ?? (
        <input
          id={`cf-${name}`}
          type={type}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          placeholder={placeholder}
          className={`form-input ${errors[name] ? 'error' : ''}`}
        />
      )}
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  )

  const S = ({ name, label, required, options }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`cf-${name}`}>
        {label} {required && <span className="required">*</span>}
      </label>
      <select
        id={`cf-${name}`}
        value={form[name]}
        onChange={e => set(name, e.target.value)}
        className={`form-select ${errors[name] ? 'error' : ''}`}
      >
        <option value="">Selecione…</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        initial={{ scale: .93, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .93, opacity: 0, y: 12 }}
        transition={{ duration: .2 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? '✏️ Editar cliente' : '➕ Novo cliente'}
          </h2>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} noValidate>

            {/* Section: Personal */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase',
                letterSpacing: '.7px', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                Dados do contato
              </div>
              <div className="form-grid">
                <F name="name" label="Nome completo" required placeholder="Ana Souza" />
                <F name="email" label="Email" required type="email" placeholder="ana@empresa.com" />
                <F name="phone" label="Telefone" required placeholder="(11) 98765-4321" />
                <F name="company" label="Empresa" placeholder="Empresa Ltda" />
              </div>
            </div>

            {/* Section: Project */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase',
                letterSpacing: '.7px', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                Dados do projeto
              </div>
              <div className="form-grid">
                <F name="projectValue" label="Valor do projeto (R$)" required type="number" placeholder="5000">
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)',
                    }}>R$</span>
                    <input
                      id="cf-projectValue"
                      type="number" min="0" step="0.01"
                      value={form.projectValue}
                      onChange={e => set('projectValue', e.target.value)}
                      placeholder="0,00"
                      className={`form-input ${errors.projectValue ? 'error' : ''}`}
                      style={{ paddingLeft: 32 }}
                    />
                  </div>
                </F>
                <S name="paymentStatus" label="Status de pagamento" required options={[
                  { value: 'pendente', label: 'Pendente' },
                  { value: 'pago',     label: 'Pago' },
                  { value: 'atrasado', label: 'Atrasado' },
                ]} />
                <F name="startDate" label="Data de início" required type="date" />
                <F name="endDate" label="Data final prevista" required type="date" />
              </div>
              <div className="form-grid" style={{ marginTop: 14 }}>
                <S name="projectStatus" label="Status do projeto" required options={[
                  { value: 'andamento', label: 'Em andamento' },
                  { value: 'concluido', label: 'Concluído' },
                  { value: 'cancelado', label: 'Cancelado' },
                ]} />
                <div className="form-group full" style={{ gridColumn: '2' }}>
                  <label className="form-label" htmlFor="cf-notes">Observações</label>
                  <textarea
                    id="cf-notes"
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Detalhes do projeto, observações…"
                    className="form-textarea"
                    style={{ minHeight: 64 }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end',
              paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Salvando…</>
                  : isEdit ? 'Salvar alterações' : 'Adicionar cliente'}
              </button>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  )
}