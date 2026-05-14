// src/components/finance/PaymentDrawer.jsx
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ── helpers ──────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0)

const fmtDate = (d) => {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

const PAYMENT_METHODS = [
  { value: "pix",           label: "Pix"                   },
  { value: "boleto",        label: "Boleto Bancário"        },
  { value: "cartao",        label: "Cartão de Crédito"      },
  { value: "transferencia", label: "Transferência Bancária" },
  { value: "dinheiro",      label: "Dinheiro"               },
]

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "paid",    label: "Pago"     },
  { value: "overdue", label: "Atrasado" },
]

const STATUS_CONFIG = {
  paid:     { label: "Pago",     bg: "rgba(34,201,125,.12)",  color: "#22c97d" },
  pending:  { label: "Pendente", bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  overdue:  { label: "Atrasado", bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
}

function Spinner() {
  return (
    <div style={{
      width: 13, height: 13, borderRadius: "50%",
      border: "2px solid rgba(255,255,255,.2)", borderTopColor: "#fff",
      animation: "spin .6s linear infinite",
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

// ── Drawer Shell ──────────────────────────────────────────────
function DrawerShell({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", justifyContent: "flex-end" }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            style={{
              position: "relative", width: 460, background: "#0e1118",
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
              <button onClick={onClose} style={{
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

// ── Form ──────────────────────────────────────────────────────
function PaymentForm({ initial, projectName, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "", description: "", amount: "",
    payment_method: "pix", status: "pending",
    due_date: "", notes: "",
    ...(initial || {}),
    amount: initial?.amount ?? "",
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.title?.trim()) e.title = "Obrigatório"
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Valor deve ser maior que zero"
    if (!form.due_date) e.due_date = "Obrigatório"
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
    textTransform: "uppercase", letterSpacing: ".6px",
    display: "block", marginBottom: 5,
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {/* Context pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 20,
          padding: "7px 12px", borderRadius: 7, background: "#161b2a",
          border: "1px solid rgba(255,255,255,.06)", fontSize: 11,
        }}>
          <span style={{ color: "#5a6478" }}>Projeto:</span>
          <span style={{ color: "#e8eaf0", fontWeight: 500 }}>{projectName}</span>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {/* Título */}
          <div>
            <label style={labelStyle}>Descrição da Parcela *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: Entrada, Parcela 2, Sinal..."
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
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 11, color: "#5a6478", fontFamily: "monospace",
              }}>R$</span>
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
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 11, color: "#5a6478", fontFamily: "inherit", padding: 0,
            }}
          >
            <span style={{ transition: "transform .2s", display: "inline-block", transform: showAdvanced ? "rotate(90deg)" : "none", fontSize: 9 }}>▶</span>
            {showAdvanced ? "Ocultar" : "Mais"} opções
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: .18 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "grid", gap: 14, paddingTop: 4 }}>
                  <div style={{ height: 1, background: "rgba(255,255,255,.06)" }} />
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
        <button onClick={onCancel} style={{
          flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, cursor: "pointer",
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
          color: "#8892a4", fontFamily: "inherit",
        }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{
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

// ── Details View ──────────────────────────────────────────────
function PaymentDetails({ payment, projectName, onMarkPaid, onClose }) {
  if (!payment) return null

  const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending
  const isPending = payment.status === "pending" || payment.status === "pendente"
  const isOverdue = payment.status === "overdue"  || payment.status === "atrasado"

  const rows = [
    { label: "Projeto",      value: projectName },
    { label: "Descrição",    value: payment.title },
    { label: "Método",       value: PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label ?? payment.payment_method },
    { label: "Vencimento",   value: fmtDate(payment.due_date) },
    payment.paid_at && { label: "Pago em", value: fmtDate(payment.paid_at) },
  ].filter(Boolean)

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
      {/* Hero */}
      <div style={{
        background: "#161b2a", border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 12, padding: "20px 24px", textAlign: "center", marginBottom: 20,
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#e8eaf0", fontFamily: "monospace", letterSpacing: -1 }}>
          {fmt(payment.amount)}
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 5,
            fontSize: 9, fontWeight: 700, fontFamily: "monospace",
            textTransform: "uppercase", letterSpacing: ".4px",
            background: cfg.bg, color: cfg.color,
          }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Rows */}
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

      {(isPending || isOverdue) && (
        <button
          onClick={() => { onMarkPaid(payment.id); onClose() }}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 9,
            background: "rgba(34,201,125,.15)", border: "1px solid rgba(34,201,125,.3)",
            color: "#22c97d", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <Icon d="M20 6L9 17l-5-5" size={14} />
          Marcar como Pago
        </button>
      )}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────
export default function PaymentDrawer({
  mode,         // "new" | "edit" | "details" | null
  payment,      // payment object (edit/details)
  projectName,
  onSave,
  onMarkPaid,
  onClose,
}) {
  const isOpen   = mode === "new" || mode === "edit" || mode === "details"
  const isForm   = mode === "new" || mode === "edit"
  const isDetail = mode === "details"

  return (
    <DrawerShell
      open={isOpen}
      onClose={onClose}
      title={
        mode === "edit"    ? "Editar Pagamento"   :
        mode === "new"     ? "Novo Pagamento"      :
        mode === "details" ? "Detalhes do Pagamento" : ""
      }
      subtitle={projectName}
    >
      {isForm && (
        <PaymentForm
          initial={mode === "edit" ? payment : null}
          projectName={projectName}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
      {isDetail && (
        <PaymentDetails
          payment={payment}
          projectName={projectName}
          onMarkPaid={onMarkPaid}
          onClose={onClose}
        />
      )}
    </DrawerShell>
  )
}