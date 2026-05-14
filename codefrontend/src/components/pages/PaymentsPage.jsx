// src/components/pages/PaymentsPage.jsx
// Módulo de Pagamentos — integrado ao Decillion CRM
// Usa o mesmo estilo visual (inline styles, #111520, #4f6ef7, monospace, etc.)
// Props: clients (array do Supabase), addToast (fn), user (objeto Supabase)

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  fetchPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "../../services/paymentsService"

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: "pix",          label: "Pix"                  },
  { value: "boleto",       label: "Boleto Bancário"       },
  { value: "cartao",       label: "Cartão de Crédito"     },
  { value: "transferencia",label: "Transferência Bancária" },
  { value: "dinheiro",     label: "Dinheiro"              },
]

const STATUS_OPTIONS = [
  { value: "pendente",  label: "Pendente"  },
  { value: "pago",      label: "Pago"      },
  { value: "atrasado",  label: "Atrasado"  },
  { value: "cancelado", label: "Cancelado" },
]

const STATUS_CONFIG = {
  pago:      { label: "Pago",      bg: "rgba(34,201,125,.12)",  color: "#22c97d", dot: "#22c97d"  },
  pendente:  { label: "Pendente",  bg: "rgba(245,158,11,.12)",  color: "#f59e0b", dot: "#f59e0b"  },
  atrasado:  { label: "Atrasado",  bg: "rgba(239,68,68,.12)",   color: "#ef4444", dot: "#ef4444"  },
  cancelado: { label: "Cancelado", bg: "rgba(90,100,120,.15)",  color: "#8892a4", dot: "#5a6478"  },
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0)

const fmtDate = (d) => {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

const uid = () => Math.random().toString(36).slice(2, 10)

const methodLabel = (m) =>
  PAYMENT_METHODS.find((x) => x.value === m)?.label ?? m

// ─────────────────────────────────────────────────────────────
// COMPONENTES PRIMITIVOS (mesmo estilo do App.jsx)
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.cancelado
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 5,
      fontSize: 9, fontWeight: 700, fontFamily: "monospace",
      textTransform: "uppercase", letterSpacing: ".3px",
      background: c.bg, color: c.color,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.label}
    </span>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: "50%",
      border: "2px solid rgba(255,255,255,.2)", borderTopColor: "#fff",
      animation: "spin .6s linear infinite", flexShrink: 0,
    }} />
  )
}

function Icon({ d, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// DROPDOWN DE AÇÕES (⋮)
// ─────────────────────────────────────────────────────────────
function ActionsDropdown({ payment, onView, onMarkPaid, onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const items = [
    { label: "Ver detalhes",      icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", action: onView },
    (payment.status === "pendente" || payment.status === "atrasado") && {
      label: "Marcar como pago", icon: "M20 6L9 17l-5-5", action: onMarkPaid, accent: "#22c97d"
    },
    (payment.status === "pendente" || payment.status === "atrasado") && {
      label: "Enviar cobrança",  icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6", action: () => setOpen(false)
    },
    payment.status === "pago" && {
      label: "Gerar comprovante", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8", action: () => setOpen(false)
    },
    { label: "Editar pagamento",  icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z", action: onEdit },
    payment.status === "pago" && {
      label: "Duplicar pagamento", icon: "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z", action: onDuplicate
    },
    "separator",
    { label: "Excluir pagamento", icon: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6", action: onDelete, accent: "#ef4444" },
  ].filter(Boolean)

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 6, border: "1px solid rgba(255,255,255,.08)", background: "transparent",
          color: "#5a6478", cursor: "pointer", transition: "all .13s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#1c2236"; e.currentTarget.style.color = "#e8eaf0" }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5a6478" }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="7" cy="2" r="1.3" /><circle cx="7" cy="7" r="1.3" /><circle cx="7" cy="12" r="1.3" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: .95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .95, y: -4 }}
            transition={{ duration: .12 }}
            style={{
              position: "absolute", right: 0, top: 34, zIndex: 200,
              width: 200, background: "#111520",
              border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
              boxShadow: "0 16px 48px rgba(0,0,0,.5)", padding: "4px 0",
            }}
          >
            {items.map((item, i) =>
              item === "separator"
                ? <div key={i} style={{ margin: "4px 0", borderTop: "1px solid rgba(255,255,255,.06)" }} />
                : (
                  <button key={i}
                    onClick={() => { item.action(); setOpen(false) }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 9,
                      padding: "8px 12px", background: "none", border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                      color: item.accent || "#8892a4", textAlign: "left", transition: "all .1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#161b2a"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <Icon d={item.icon} size={12} />
                    {item.label}
                  </button>
                )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DRAWER BASE
// ─────────────────────────────────────────────────────────────
function Drawer({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", justifyContent: "flex-end" }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            style={{
              position: "relative", width: 440, background: "#0e1118",
              borderLeft: "1px solid rgba(255,255,255,.08)",
              display: "flex", flexDirection: "column", height: "100%",
              boxShadow: "-24px 0 80px rgba(0,0,0,.5)",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              padding: "20px 24px 18px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0" }}>{title}</div>
                {subtitle && <div style={{ fontSize: 11, color: "#5a6478", marginTop: 3 }}>{subtitle}</div>}
              </div>
              <button onClick={onClose}
                style={{
                  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 6, border: "1px solid rgba(255,255,255,.08)", background: "none",
                  color: "#5a6478", cursor: "pointer", fontSize: 16,
                }}>×</button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────
// FORMULÁRIO DE PAGAMENTO
// ─────────────────────────────────────────────────────────────
function PaymentForm({ initial, clientName, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "", description: "", amount: "", payment_method: "pix",
    status: "pendente", due_date: "", installments: 1,
    recurring: false, notes: "",
    ...(initial || {}),
    amount: initial?.amount ?? "",
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.title?.trim())  e.title    = "Obrigatório"
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Valor deve ser maior que zero"
    if (!form.due_date)       e.due_date  = "Obrigatório"
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    await onSave({ ...form, amount: parseFloat(form.amount) })
    setSaving(false)
  }

  const inputStyle = {
    width: "100%", background: "#161b2a",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
    padding: "9px 12px", fontSize: 12, color: "#e8eaf0",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    transition: "border-color .15s",
  }
  const labelStyle = {
    fontSize: 9, color: "#5a6478", fontFamily: "monospace",
    textTransform: "uppercase", letterSpacing: ".6px", display: "block", marginBottom: 5,
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

        {/* Context */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 20,
          padding: "7px 12px", borderRadius: 7, background: "#161b2a",
          border: "1px solid rgba(255,255,255,.06)", fontSize: 11,
        }}>
          <span style={{ color: "#5a6478" }}>Cliente:</span>
          <span style={{ color: "#e8eaf0", fontWeight: 500 }}>{clientName}</span>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {/* Descrição */}
          <div>
            <label style={labelStyle}>Descrição *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: Desenvolvimento de site..."
              style={{ ...inputStyle, borderColor: errors.title ? "#ef4444" : "rgba(255,255,255,.1)" }}
              onFocus={e => e.target.style.borderColor = "#4f6ef7"}
              onBlur={e => e.target.style.borderColor = errors.title ? "#ef4444" : "rgba(255,255,255,.1)"}
            />
            {errors.title && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{errors.title}</div>}
          </div>

          {/* Valor */}
          <div>
            <label style={labelStyle}>Valor (R$) *</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#5a6478", fontFamily: "monospace" }}>R$</span>
              <input
                type="number" min="0" step="0.01"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="0,00"
                style={{ ...inputStyle, paddingLeft: 36, borderColor: errors.amount ? "#ef4444" : "rgba(255,255,255,.1)" }}
                onFocus={e => e.target.style.borderColor = "#4f6ef7"}
                onBlur={e => e.target.style.borderColor = errors.amount ? "#ef4444" : "rgba(255,255,255,.1)"}
              />
            </div>
            {errors.amount && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{errors.amount}</div>}
          </div>

          {/* Método */}
          <div>
            <label style={labelStyle}>Forma de Pagamento</label>
            <select
              value={form.payment_method}
              onChange={(e) => set("payment_method", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Status + Vencimento */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Vencimento *</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark", borderColor: errors.due_date ? "#ef4444" : "rgba(255,255,255,.1)" }}
                onFocus={e => e.target.style.borderColor = "#4f6ef7"}
                onBlur={e => e.target.style.borderColor = errors.due_date ? "#ef4444" : "rgba(255,255,255,.1)"}
              />
              {errors.due_date && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{errors.due_date}</div>}
            </div>
          </div>

          {/* Toggle avançado */}
          <button
            onClick={() => setShowAdvanced((s) => !s)}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              cursor: "pointer", fontSize: 11, color: "#5a6478", fontFamily: "inherit", padding: 0,
            }}
          >
            <span style={{ transition: "transform .2s", display: "inline-block", transform: showAdvanced ? "rotate(90deg)" : "none", fontSize: 9 }}>▶</span>
            {showAdvanced ? "Ocultar" : "Mais"} opções
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: .18 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "grid", gap: 14, paddingTop: 4 }}>
                  <div style={{ height: 1, background: "rgba(255,255,255,.06)" }} />

                  {/* Parcelas + Recorrente */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "end" }}>
                    <div>
                      <label style={labelStyle}>Nº de Parcelas</label>
                      <input
                        type="number" min="1" max="48"
                        value={form.installments}
                        onChange={(e) => set("installments", parseInt(e.target.value) || 1)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Recorrente</label>
                      <div
                        onClick={() => set("recurring", !form.recurring)}
                        style={{
                          width: 40, height: 22, borderRadius: 20, cursor: "pointer",
                          background: form.recurring ? "#4f6ef7" : "#1c2236",
                          border: `1px solid ${form.recurring ? "#4f6ef7" : "rgba(255,255,255,.1)"}`,
                          position: "relative", transition: "all .2s",
                        }}
                      >
                        <div style={{
                          position: "absolute", top: 2, left: form.recurring ? 18 : 2,
                          width: 16, height: 16, borderRadius: "50%",
                          background: form.recurring ? "#fff" : "#5a6478",
                          transition: "left .2s",
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label style={labelStyle}>Observações</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder="Notas internas, acordos, observações..."
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    />
                  </div>

                  {/* Descrição detalhada */}
                  <div>
                    <label style={labelStyle}>Descrição detalhada</label>
                    <input
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Detalhes adicionais..."
                      style={inputStyle}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,.07)",
        display: "flex", gap: 10, flexShrink: 0,
      }}>
        <button onClick={onCancel}
          style={{
            flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, cursor: "pointer",
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
            color: "#8892a4", fontFamily: "inherit",
          }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={saving}
          style={{
            flex: 2, padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: saving ? "default" : "pointer",
            background: saving ? "rgba(79,110,247,.6)" : "#4f6ef7",
            border: "none", color: "#fff", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: saving ? .8 : 1,
          }}>
          {saving && <Spinner />}
          {saving ? "Salvando…" : "Salvar Pagamento"}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DRAWER DE DETALHES
// ─────────────────────────────────────────────────────────────
function PaymentDetails({ payment, clientName, onMarkPaid, onClose }) {
  if (!payment) return null

  const rows = [
    { label: "Cliente",    value: clientName },
    { label: "Descrição",  value: payment.title },
    { label: "Método",     value: methodLabel(payment.payment_method) },
    { label: "Vencimento", value: fmtDate(payment.due_date) },
    payment.paid_at && { label: "Pago em",   value: fmtDate(payment.paid_at) },
    payment.installments > 1 && { label: "Parcelas", value: `${payment.installments}× parcelas` },
    payment.recurring && { label: "Recorrência", value: "Sim — pagamento recorrente" },
  ].filter(Boolean)

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
      {/* Hero valor */}
      <div style={{
        background: "#161b2a", border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 12, padding: "20px 24px", textAlign: "center", marginBottom: 20,
      }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#e8eaf0", fontFamily: "monospace", letterSpacing: -1 }}>
          {fmt(payment.amount)}
        </div>
        <div style={{ marginTop: 10 }}>
          <StatusBadge status={payment.status} />
        </div>
        {payment.recurring && (
          <div style={{ fontSize: 10, color: "#4f6ef7", marginTop: 8, fontFamily: "monospace" }}>↺ Recorrente</div>
        )}
      </div>

      {/* Detalhes */}
      <div style={{ marginBottom: 20 }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0",
            borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none",
          }}>
            <span style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: ".5px" }}>
              {row.label}
            </span>
            <span style={{ fontSize: 12, color: "#e8eaf0", fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Observações */}
      {payment.notes && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>
            Observações
          </div>
          <div style={{
            background: "#161b2a", border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "#8892a4", lineHeight: 1.6,
          }}>
            {payment.notes}
          </div>
        </div>
      )}

      {/* CTA */}
      {(payment.status === "pendente" || payment.status === "atrasado") && (
        <button
          onClick={() => { onMarkPaid(payment.id); onClose() }}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 9,
            background: "rgba(34,201,125,.15)", border: "1px solid rgba(34,201,125,.3)",
            color: "#22c97d", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          <Icon d="M20 6L9 17l-5-5" size={14} />
          Marcar como Pago
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CARDS DE RESUMO
// ─────────────────────────────────────────────────────────────
function SummaryCards({ payments }) {
  const total    = payments.reduce((s, p) => s + Number(p.amount), 0)
  const received = payments.filter((p) => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0)
  const pending  = payments.filter((p) => p.status === "pendente").reduce((s, p) => s + Number(p.amount), 0)
  const overdue  = payments.filter((p) => p.status === "atrasado").reduce((s, p) => s + Number(p.amount), 0)

  const cards = [
    { label: "Total Faturado", value: fmt(total),    sub: `${payments.length} pagamentos`,                                    color: "#e8eaf0" },
    { label: "Recebido",       value: fmt(received), sub: `${payments.filter(p => p.status === "pago").length} pagos`,        color: "#22c97d" },
    { label: "A Receber",      value: fmt(pending),  sub: `${payments.filter(p => p.status === "pendente").length} pendentes`, color: "#f59e0b" },
    { label: "Em Atraso",      value: fmt(overdue),  sub: `${payments.filter(p => p.status === "atrasado").length} atrasados`, color: "#ef4444" },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: "#111520", border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 10, padding: "12px 16px",
        }}>
          <div style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 }}>
            {c.label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontFamily: "monospace", letterSpacing: "-.5px" }}>
            {c.value}
          </div>
          <div style={{ fontSize: 10, color: "#3a4255", marginTop: 4, fontFamily: "monospace" }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PRÓXIMOS VENCIMENTOS
// ─────────────────────────────────────────────────────────────
function UpcomingPayments({ payments }) {
  const upcoming = payments
    .filter((p) => p.status === "pendente" || p.status === "atrasado")
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
    .slice(0, 4)

  if (!upcoming.length) return null

  return (
    <div style={{
      background: "#111520", border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 10, padding: "12px 16px", marginBottom: 16,
    }}>
      <div style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>
        Próximos Vencimentos
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {upcoming.map((p) => {
          const isOverdue = p.status === "atrasado"
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOverdue ? "#ef4444" : "#f59e0b", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#8892a4" }}>{p.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace" }}>{fmtDate(p.due_date)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: isOverdue ? "#ef4444" : "#e8eaf0", fontFamily: "monospace" }}>
                  {fmt(p.amount)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SELETOR DE CLIENTE
// ─────────────────────────────────────────────────────────────
function ClientSelector({ clients, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
          borderRadius: 8, background: "#161b2a", border: "1px solid rgba(255,255,255,.1)",
          cursor: "pointer", fontFamily: "inherit", color: "#e8eaf0", fontSize: 13,
          minWidth: 220,
        }}
      >
        {selected
          ? <>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: "rgba(79,110,247,.2)", color: "#4f6ef7",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, flexShrink: 0,
              }}>
                {selected.name?.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{selected.name}</span>
            </>
          : <span style={{ color: "#5a6478" }}>Selecionar cliente…</span>
        }
        <span style={{ marginLeft: "auto", color: "#5a6478", fontSize: 10 }}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: .97 }}
            transition={{ duration: .13 }}
            style={{
              position: "absolute", top: 42, left: 0, zIndex: 100, minWidth: 260,
              background: "#111520", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 10, boxShadow: "0 16px 48px rgba(0,0,0,.5)",
              padding: "6px 0", maxHeight: 280, overflowY: "auto",
            }}
          >
            {clients.length === 0
              ? <div style={{ padding: "16px", fontSize: 12, color: "#5a6478", textAlign: "center" }}>Nenhum cliente</div>
              : clients.map((c) => (
                <button key={c.id}
                  onClick={() => { onSelect(c); setOpen(false) }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px", background: selected?.id === c.id ? "#161b2a" : "none",
                    border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#161b2a"}
                  onMouseLeave={e => e.currentTarget.style.background = selected?.id === c.id ? "#161b2a" : "none"}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: "rgba(79,110,247,.15)", color: "#4f6ef7",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, flexShrink: 0,
                  }}>
                    {c.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#e8eaf0", fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#5a6478" }}>{c.company || c.email}</div>
                  </div>
                  {selected?.id === c.id && (
                    <span style={{ marginLeft: "auto", color: "#4f6ef7", fontSize: 12 }}>✓</span>
                  )}
                </button>
              ))
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TABELA DE PAGAMENTOS
// ─────────────────────────────────────────────────────────────
function PaymentsTable({ payments, loading, onView, onMarkPaid, onEdit, onDuplicate, onDelete }) {
  if (loading) {
    return (
      <div style={{
        background: "#111520", border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 12, overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} style={{ padding: "14px 16px" }}>
                    <div style={{
                      height: 11, borderRadius: 5,
                      width: [100, 140, 80, 70, 60, 40][j],
                      background: "linear-gradient(90deg,#1c2236 25%,#252d42 50%,#1c2236 75%)",
                      backgroundSize: "400% 100%",
                      animation: "shimmer 1.4s ease infinite",
                    }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div style={{
        background: "#111520", border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 12, padding: "56px 0", textAlign: "center",
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💳</div>
        <div style={{ fontSize: 13, color: "#5a6478", fontWeight: 500 }}>Nenhum pagamento registrado</div>
        <div style={{ fontSize: 11, color: "#3a4255", marginTop: 4 }}>Clique em "+ Novo Pagamento" para começar</div>
      </div>
    )
  }

  return (
    <div style={{
      background: "#111520", border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 12, overflow: "hidden",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Descrição", "Método", "Vencimento", "Valor", "Status", ""].map((h, i) => (
              <th key={i} style={{
                padding: "10px 16px", textAlign: i === 3 ? "right" : i === 4 ? "center" : "left",
                fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: ".8px", color: "#5a6478", fontFamily: "monospace",
                borderBottom: "1px solid rgba(255,255,255,.05)", whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {payments.map((p) => (
              <motion.tr key={p.id} layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ borderBottom: "1px solid rgba(255,255,255,.03)", cursor: "pointer" }}
                onClick={() => onView(p)}
                onMouseEnter={e => e.currentTarget.style.background = "#161b2a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{p.title}</div>
                  {p.description && (
                    <div style={{ fontSize: 10, color: "#5a6478", marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.description}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                    {p.installments > 1 && (
                      <span style={{ fontSize: 9, color: "#4f6ef7", fontFamily: "monospace" }}>{p.installments}× parcelas</span>
                    )}
                    {p.recurring && (
                      <span style={{ fontSize: 9, color: "#a78bfa", fontFamily: "monospace" }}>↺ Recorrente</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: "#5a6478" }}>
                  {methodLabel(p.payment_method)}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: "#5a6478", fontFamily: "monospace" }}>
                  {fmtDate(p.due_date)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#22c97d", fontFamily: "monospace" }}>
                  {fmt(p.amount)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <StatusBadge status={p.status} />
                </td>
                <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                  <ActionsDropdown
                    payment={p}
                    onView={() => onView(p)}
                    onMarkPaid={() => onMarkPaid(p.id)}
                    onEdit={() => onEdit(p)}
                    onDuplicate={() => onDuplicate(p)}
                    onDelete={() => onDelete(p.id)}
                  />
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function PaymentsPage({ clients = [], addToast }) {
  const [selectedClient, setSelectedClient] = useState(null)
  const [payments, setPayments]             = useState([])
  const [loading, setLoading]               = useState(false)

  // drawer: null | "new" | "edit" | "details"
  const [drawerMode, setDrawerMode] = useState(null)
  const [selected, setSelected]     = useState(null)

  // Carrega pagamentos do cliente selecionado
  useEffect(() => {
    if (!selectedClient) { setPayments([]); return }
    setLoading(true)
    fetchPayments(selectedClient.id)
      .then(setPayments)
      .catch(() => addToast("Erro ao carregar pagamentos.", "error"))
      .finally(() => setLoading(false))
  }, [selectedClient])

  // Salvar (criar ou editar)
  const savePayment = useCallback(async (form) => {
    const isEdit = drawerMode === "edit" && selected
    try {
      if (isEdit) {
        const updated = await updatePayment(selected.id, form)
        setPayments((prev) => prev.map((p) => (p.id === selected.id ? updated : p)))
        addToast("Pagamento atualizado!", "success")
      } else {
        const created = await createPayment(selectedClient.id, form)
        setPayments((prev) => [created, ...prev])
        addToast("Pagamento criado com sucesso!", "success")
      }
      setDrawerMode(null)
      setSelected(null)
    } catch {
      addToast("Erro ao salvar pagamento.", "error")
    }
  }, [drawerMode, selected, selectedClient])

  // Marcar como pago
  const markPaid = useCallback(async (id) => {
    try {
      const updated = await updatePayment(id, {
        status: "pago",
        paid_at: new Date().toISOString().slice(0, 10),
      })
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)))
      addToast("Pagamento marcado como pago!", "success")
    } catch {
      addToast("Erro ao atualizar pagamento.", "error")
    }
  }, [])

  // Excluir
  const handleDelete = useCallback(async (id) => {
    try {
      await deletePayment(id)
      setPayments((prev) => prev.filter((p) => p.id !== id))
      addToast("Pagamento removido.", "warning")
    } catch {
      addToast("Erro ao excluir pagamento.", "error")
    }
  }, [])

  // Duplicar
  const handleDuplicate = useCallback(async (payment) => {
    try {
      const dup = await createPayment(selectedClient.id, {
        title:          payment.title + " (cópia)",
        description:    payment.description,
        amount:         payment.amount,
        payment_method: payment.payment_method,
        status:         "pendente",
        due_date:       "",
        installments:   payment.installments,
        recurring:      payment.recurring,
        notes:          payment.notes,
      })
      setPayments((prev) => [dup, ...prev])
      addToast("Pagamento duplicado!", "success")
    } catch {
      addToast("Erro ao duplicar pagamento.", "error")
    }
  }, [selectedClient])

  const closeDrawer = () => { setDrawerMode(null); setSelected(null) }

  return (
    <div>
      <style>{`
        @keyframes shimmer { to { background-position: -400% 0; } }
        @keyframes spin    { to { transform: rotate(360deg); }   }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <ClientSelector
          clients={clients}
          selected={selectedClient}
          onSelect={setSelectedClient}
        />

        {selectedClient && (
          <button
            onClick={() => { setSelected(null); setDrawerMode("new") }}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 18px",
              borderRadius: 8, background: "#4f6ef7", border: "none",
              color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit", boxShadow: "0 4px 16px rgba(79,110,247,.3)",
            }}>
            + Novo Pagamento
          </button>
        )}
      </div>

      {/* ── Conteúdo ── */}
      {!selectedClient ? (
        <div style={{
          background: "#111520", border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 12, padding: "72px 0", textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 14, color: "#5a6478", fontWeight: 500 }}>Selecione um cliente</div>
          <div style={{ fontSize: 11, color: "#3a4255", marginTop: 4 }}>
            Escolha um cliente acima para ver e gerenciar seus pagamentos
          </div>
        </div>
      ) : (
        <>
          <SummaryCards payments={payments} />
          <UpcomingPayments payments={payments} />
          <PaymentsTable
            payments={payments}
            loading={loading}
            onView={(p)  => { setSelected(p); setDrawerMode("details") }}
            onMarkPaid={markPaid}
            onEdit={(p)  => { setSelected(p); setDrawerMode("edit") }}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* ── Drawer: Novo / Editar ── */}
      <Drawer
        open={drawerMode === "new" || drawerMode === "edit"}
        onClose={closeDrawer}
        title={drawerMode === "edit" ? "Editar Pagamento" : "Novo Pagamento"}
        subtitle={selectedClient?.name}
      >
        <PaymentForm
          initial={drawerMode === "edit" ? selected : null}
          clientName={selectedClient?.name}
          onSave={savePayment}
          onCancel={closeDrawer}
        />
      </Drawer>

      {/* ── Drawer: Detalhes ── */}
      <Drawer
        open={drawerMode === "details"}
        onClose={closeDrawer}
        title="Detalhes do Pagamento"
        subtitle={selectedClient?.name}
      >
        <PaymentDetails
          payment={selected}
          clientName={selectedClient?.name}
          onMarkPaid={markPaid}
          onClose={closeDrawer}
        />
      </Drawer>
    </div>
  )
}