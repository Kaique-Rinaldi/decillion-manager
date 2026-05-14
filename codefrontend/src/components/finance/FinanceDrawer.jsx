// src/components/finance/FinanceDrawer.jsx
import { useState } from "react"
import { motion } from "framer-motion"
import { X, Pencil, Trash2 } from "lucide-react"
import FinanceProgressBar from "./FinanceProgressBar"
import PaymentTimeline from "./PaymentTimeline"
import { usePayments } from "../../hooks/usePayments"

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)

const STATUS = {
  pending: { label: "Pendente",  color: "var(--amber)", bg: "var(--amber-dim)" },
  partial: { label: "Parcial",   color: "var(--blue)",  bg: "var(--blue-dim)"  },
  paid:    { label: "Pago",      color: "var(--green)", bg: "var(--green-dim)" },
  overdue: { label: "Atrasado",  color: "var(--red)",   bg: "var(--red-dim)"   },
}

const TABS = ["Pagamentos", "Resumo", "Notas"]

function Avatar({ client, size = 48 }) {
  const initials = (client?.name || "?")
    .split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

  if (client?.avatar_url) {
    return <img src={client.avatar_url} alt={client.name} className="drawer-avatar" style={{ width: size, height: size }} />
  }
  return (
    <div className="drawer-avatar drawer-avatar--initials" style={{ width: size, height: size, fontSize: size * 0.33 }}>
      {initials}
    </div>
  )
}

export default function FinanceDrawer({ record, onClose, onRecordUpdated, onDelete, addToast }) {
  const [activeTab, setActiveTab] = useState("Pagamentos")

  const { payments, loading: paymentsLoading, addPayment, editPayment, markPaid, removePayment, dupPayment } =
    usePayments(record.id, onRecordUpdated, addToast)

  const status = STATUS[record.status] || STATUS.pending
  const pct = record.total_amount > 0
    ? Math.round((record.received_amount / record.total_amount) * 100)
    : 0

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.aside
        className="drawer-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 38 }}
      >
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header__left">
            <Avatar client={record.clients} />
            <div>
              <p className="drawer-client-company">
                {record.clients?.company || record.clients?.name || "Cliente"}
              </p>
              <h2 className="drawer-title">{record.title}</h2>
              <div
                className="status-badge"
                style={{ color: status.color, background: status.bg, marginTop: 6, display: "inline-flex" }}
              >
                {status.label}
              </div>
            </div>
          </div>

          <div className="drawer-header__right">
            <button className="drawer-icon-btn" title="Excluir" onClick={() => onDelete(record.id)}>
              <Trash2 size={15} color="var(--red)" />
            </button>
            <button className="drawer-icon-btn" title="Fechar" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="drawer-summary">
          <div className="drawer-amounts">
            <div className="drawer-amount-item">
              <span className="drawer-amount-label">Total</span>
              <span className="drawer-amount-value">{fmt(record.total_amount)}</span>
            </div>
            <div className="drawer-amount-divider" />
            <div className="drawer-amount-item">
              <span className="drawer-amount-label">Recebido</span>
              <span className="drawer-amount-value" style={{ color: "var(--green)" }}>
                {fmt(record.received_amount)}
              </span>
            </div>
            <div className="drawer-amount-divider" />
            <div className="drawer-amount-item">
              <span className="drawer-amount-label">Restante</span>
              <span className="drawer-amount-value" style={{ color: "var(--amber)" }}>
                {fmt(record.remaining_amount)}
              </span>
            </div>
          </div>

          <div className="drawer-progress-wrap">
            <FinanceProgressBar value={pct} color={status.color} height={8} />
            <span className="drawer-progress-pct">{pct}% concluído</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="drawer-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`drawer-tab ${activeTab === tab ? "drawer-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && (
                <motion.span className="drawer-tab__line" layoutId="drawer-tab-line" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="drawer-content">
          {activeTab === "Pagamentos" && (
            <PaymentTimeline
              payments={payments}
              loading={paymentsLoading}
              onAdd={addPayment}
              onEdit={editPayment}
              onMarkPaid={markPaid}
              onDelete={removePayment}
              onDuplicate={dupPayment}
              addToast={addToast}
            />
          )}

          {activeTab === "Resumo" && (
            <div className="drawer-notes-tab">
              {record.description ? (
                <p className="drawer-description">{record.description}</p>
              ) : (
                <p className="drawer-empty-text">Sem descrição.</p>
              )}
              <div className="drawer-meta-grid">
                {record.start_date && (
                  <div className="drawer-meta-item">
                    <span className="drawer-meta-label">Início</span>
                    <span className="drawer-meta-value">
                      {new Date(record.start_date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                {record.due_date && (
                  <div className="drawer-meta-item">
                    <span className="drawer-meta-label">Vencimento</span>
                    <span className="drawer-meta-value">
                      {new Date(record.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                <div className="drawer-meta-item">
                  <span className="drawer-meta-label">Criado em</span>
                  <span className="drawer-meta-value">
                    {new Date(record.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Notas" && (
            <div className="drawer-notes-tab">
              {record.notes ? (
                <p className="drawer-description">{record.notes}</p>
              ) : (
                <p className="drawer-empty-text">Nenhuma nota adicionada.</p>
              )}
            </div>
          )}
        </div>
      </motion.aside>

      <style>{css}</style>
    </>
  )
}

const css = `
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(2px);
    z-index: 200;
  }

  .drawer-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 480px;
    max-width: 100vw;
    background: var(--bg-surface);
    border-left: 1px solid var(--border);
    z-index: 201;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px 24px 20px;
    border-bottom: 1px solid var(--border);
    gap: 12px;
  }
  .drawer-header__left { display: flex; gap: 14px; align-items: flex-start; flex: 1; min-width: 0; }
  .drawer-header__right { display: flex; gap: 6px; flex-shrink: 0; }

  .drawer-avatar {
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .drawer-avatar--initials {
    background: var(--bg-overlay);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--text-secondary);
  }

  .drawer-client-company {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 3px;
  }
  .drawer-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .drawer-icon-btn {
    width: 32px;
    height: 32px;
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .drawer-icon-btn:hover { background: var(--bg-overlay); border-color: var(--border-hover); color: var(--text-primary); }

  .drawer-summary {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
  }

  .drawer-amounts {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 16px;
  }
  .drawer-amount-item {
    flex: 1;
    text-align: center;
  }
  .drawer-amount-divider {
    width: 1px;
    height: 32px;
    background: var(--border);
  }
  .drawer-amount-label {
    display: block;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }
  .drawer-amount-value {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }

  .drawer-progress-wrap {}
  .drawer-progress-pct {
    display: block;
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 6px;
    text-align: right;
  }

  .drawer-tabs {
    display: flex;
    gap: 0;
    padding: 0 24px;
    border-bottom: 1px solid var(--border);
  }
  .drawer-tab {
    position: relative;
    background: none;
    border: none;
    padding: 14px 16px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 400;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.2s;
  }
  .drawer-tab:hover { color: var(--text-primary); }
  .drawer-tab--active { color: var(--text-primary); font-weight: 500; }
  .drawer-tab__line {
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 2px;
    background: var(--accent);
    border-radius: 2px;
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--bg-overlay) transparent;
  }
  .drawer-content::-webkit-scrollbar { width: 4px; }
  .drawer-content::-webkit-scrollbar-thumb { background: var(--bg-overlay); border-radius: 99px; }

  .drawer-notes-tab {}
  .drawer-description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0 0 20px;
  }
  .drawer-empty-text {
    font-size: 13px;
    color: var(--text-muted);
    font-style: italic;
    margin: 0;
  }
  .drawer-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .drawer-meta-item {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 12px 14px;
  }
  .drawer-meta-label {
    display: block;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }
  .drawer-meta-value {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }

  @media (max-width: 540px) {
    .drawer-panel { width: 100vw; }
  }
`