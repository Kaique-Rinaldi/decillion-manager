// src/components/finance/FinancialRecordCard.jsx
import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Trash2, MoreHorizontal } from "lucide-react"
import FinanceProgressBar from "./FinanceProgressBar"

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)

const STATUS = {
  pending: { label: "Pendente",  color: "var(--amber)", bg: "var(--amber-dim)" },
  partial: { label: "Parcial",   color: "var(--blue)",  bg: "var(--blue-dim)"  },
  paid:    { label: "Pago",      color: "var(--green)", bg: "var(--green-dim)" },
  overdue: { label: "Atrasado",  color: "var(--red)",   bg: "var(--red-dim)"   },
}

function Avatar({ client }) {
  const initials = (client?.name || "?")
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()

  if (client?.avatar_url) {
    return <img src={client.avatar_url} alt={client.name} className="record-avatar" />
  }
  return (
    <div className="record-avatar record-avatar--initials">
      {initials}
    </div>
  )
}

export default function FinancialRecordCard({ record, selected, onSelect, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const status = STATUS[record.status] || STATUS.pending
  const pct = record.total_amount > 0
    ? Math.round((record.received_amount / record.total_amount) * 100)
    : 0

  return (
    <>
      <motion.div
        className={`record-card ${selected ? "record-card--selected" : ""}`}
        whileHover={{ borderColor: "var(--border-hover)" }}
        onClick={onSelect}
      >
        {/* Avatar */}
        <Avatar client={record.clients} />

        {/* Client + Title */}
        <div className="record-card__info">
          <p className="record-card__client">
            {record.clients?.company || record.clients?.name || "Cliente"}
          </p>
          <p className="record-card__title">{record.title}</p>
        </div>

        {/* Amounts */}
        <div className="record-card__amounts">
          <p className="record-card__total">{fmt(record.total_amount)}</p>
          <p className="record-card__received">
            <span className="amt-green">{fmt(record.received_amount)}</span>
            {" recebido"}
          </p>
          <p className="record-card__remaining">
            {fmt(record.remaining_amount)} restante
          </p>
        </div>

        {/* Progress */}
        <div className="record-card__progress-wrap">
          <FinanceProgressBar value={pct} color={status.color} />
          <p className="record-card__pct">{pct}%</p>
        </div>

        {/* Badge */}
        <div
          className="status-badge"
          style={{ color: status.color, background: status.bg }}
        >
          {status.label}
        </div>

        {/* Actions */}
        <div className="record-card__actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="record-action-btn"
            onClick={() => setMenuOpen(v => !v)}
            title="Mais opções"
          >
            <MoreHorizontal size={15} />
          </button>

          {menuOpen && (
            <div className="record-menu">
              <button
                className="record-menu__item record-menu__item--danger"
                onClick={() => { setMenuOpen(false); onDelete() }}
              >
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          )}
        </div>

        <ChevronRight size={15} className="record-card__arrow" />
      </motion.div>

      <style>{css}</style>
    </>
  )
}

const css = `
  .record-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    position: relative;
  }
  .record-card:hover {
    background: var(--bg-elevated);
    box-shadow: 0 2px 16px rgba(0,0,0,0.25);
  }
  .record-card--selected {
    border-color: var(--accent) !important;
    background: var(--bg-elevated);
    box-shadow: 0 0 0 1px var(--accent), 0 0 24px var(--accent-dim);
  }

  .record-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .record-avatar--initials {
    background: var(--bg-overlay);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .record-card__info {
    flex: 1;
    min-width: 0;
  }
  .record-card__client {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0 0 2px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .record-card__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .record-card__amounts {
    text-align: right;
    flex-shrink: 0;
  }
  .record-card__total {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 2px;
    letter-spacing: -0.3px;
  }
  .record-card__received,
  .record-card__remaining {
    font-size: 11px;
    color: var(--text-muted);
    margin: 0;
  }
  .amt-green { color: var(--green); }

  .record-card__progress-wrap {
    width: 140px;
    flex-shrink: 0;
  }
  .record-card__pct {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 4px 0 0;
    text-align: right;
  }

  .status-badge {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 99px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .record-card__actions {
    position: relative;
    flex-shrink: 0;
  }
  .record-action-btn {
    width: 30px;
    height: 30px;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .record-action-btn:hover {
    color: var(--text-primary);
    border-color: var(--border);
    background: var(--bg-overlay);
  }

  .record-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 4px;
    z-index: 100;
    min-width: 140px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .record-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    background: none;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-align: left;
  }
  .record-menu__item:hover { background: var(--bg-overlay); color: var(--text-primary); }
  .record-menu__item--danger:hover { color: var(--red); }

  .record-card__arrow {
    color: var(--text-muted);
    flex-shrink: 0;
    transition: transform 0.2s, color 0.2s;
  }
  .record-card:hover .record-card__arrow,
  .record-card--selected .record-card__arrow {
    transform: translateX(3px);
    color: var(--accent);
  }

  @media (max-width: 768px) {
    .record-card { flex-wrap: wrap; gap: 12px; }
    .record-card__progress-wrap { width: 100%; order: 10; }
    .record-card__amounts { text-align: left; }
  }
`