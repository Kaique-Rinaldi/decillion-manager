// src/components/finance/PaymentItem.jsx
import { useState } from "react"
import { motion } from "framer-motion"
import { Check, MoreHorizontal, CheckCircle2, Circle, Clock, AlertCircle, Copy, Pencil, Trash2 } from "lucide-react"

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)

const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—"

const METHOD_LABELS = {
  pix:         "Pix",
  boleto:      "Boleto",
  credit_card: "Cartão",
  transfer:    "Transferência",
  cash:        "Dinheiro",
}

const STATUS_ICON = {
  paid:    <CheckCircle2 size={16} color="var(--green)" />,
  pending: <Circle      size={16} color="var(--text-muted)" />,
  overdue: <AlertCircle size={16} color="var(--red)" />,
}

const STATUS_STYLE = {
  paid:    { color: "var(--green)",         lineBg: "var(--green-dim)" },
  pending: { color: "var(--text-secondary)", lineBg: "var(--bg-overlay)" },
  overdue: { color: "var(--red)",            lineBg: "var(--red-dim)" },
}

export default function PaymentItem({ payment, isLast, onMarkPaid, onEdit, onDelete, onDuplicate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const st = STATUS_STYLE[payment.status] || STATUS_STYLE.pending

  return (
    <>
      <div className="payment-item">
        {/* Timeline line */}
        <div className="payment-item__track">
          <div className="payment-item__dot" style={{ color: st.color }}>
            {STATUS_ICON[payment.status] || STATUS_ICON.pending}
          </div>
          {!isLast && <div className="payment-item__line" />}
        </div>

        {/* Body */}
        <div className={`payment-item__body ${payment.status === "paid" ? "payment-item__body--paid" : ""}`}>
          <div className="payment-item__row">
            <div className="payment-item__main">
              <span className="payment-item__title">{payment.title}</span>
              <div className="payment-item__meta">
                <span className="payment-meta-chip">{METHOD_LABELS[payment.payment_method] || payment.payment_method}</span>
                {payment.due_date && (
                  <span className="payment-meta-date">
                    <Clock size={10} /> {fmtDate(payment.due_date)}
                  </span>
                )}
                {payment.paid_at && payment.status === "paid" && (
                  <span className="payment-meta-paid">
                    <Check size={10} /> Pago em {fmtDate(payment.paid_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="payment-item__right">
              <span className="payment-item__amount" style={{ color: st.color }}>
                {fmt(payment.amount)}
              </span>

              <div className="payment-item__actions">
                {payment.status !== "paid" && (
                  <motion.button
                    className="pay-btn"
                    title="Marcar como pago"
                    onClick={onMarkPaid}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check size={12} />
                  </motion.button>
                )}

                <div style={{ position: "relative" }}>
                  <button
                    className="pay-menu-btn"
                    onClick={() => setMenuOpen(v => !v)}
                  >
                    <MoreHorizontal size={14} />
                  </button>

                  {menuOpen && (
                    <div className="pay-menu" onClick={() => setMenuOpen(false)}>
                      {payment.status !== "paid" && (
                        <button className="pay-menu__item" onClick={onMarkPaid}>
                          <CheckCircle2 size={13} /> Marcar como pago
                        </button>
                      )}
                      <button className="pay-menu__item" onClick={onEdit}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button className="pay-menu__item" onClick={onDuplicate}>
                        <Copy size={13} /> Duplicar
                      </button>
                      <div className="pay-menu__divider" />
                      <button className="pay-menu__item pay-menu__item--danger" onClick={onDelete}>
                        <Trash2 size={13} /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {payment.notes && (
            <p className="payment-item__notes">{payment.notes}</p>
          )}
        </div>
      </div>

      <style>{css}</style>
    </>
  )
}

const css = `
  .payment-item {
    display: flex;
    gap: 12px;
    align-items: stretch;
  }

  .payment-item__track {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 14px;
    flex-shrink: 0;
    width: 20px;
  }
  .payment-item__dot { line-height: 0; }
  .payment-item__line {
    width: 1px;
    flex: 1;
    background: var(--border);
    margin: 6px 0;
    min-height: 20px;
  }

  .payment-item__body {
    flex: 1;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 12px 14px;
    margin-bottom: 8px;
    transition: border-color 0.2s;
  }
  .payment-item__body--paid {
    opacity: 0.65;
  }
  .payment-item__body:hover { border-color: var(--border-hover); }

  .payment-item__row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .payment-item__main { flex: 1; min-width: 0; }

  .payment-item__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    display: block;
    margin-bottom: 5px;
  }

  .payment-item__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .payment-meta-chip {
    font-size: 10px;
    padding: 2px 7px;
    background: var(--bg-overlay);
    border-radius: 99px;
    color: var(--text-muted);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .payment-meta-date,
  .payment-meta-paid {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--text-muted);
  }
  .payment-meta-paid { color: var(--green); }

  .payment-item__right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .payment-item__amount {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.3px;
    white-space: nowrap;
  }

  .payment-item__actions { display: flex; gap: 4px; align-items: center; }

  .pay-btn {
    width: 26px;
    height: 26px;
    background: var(--green-dim);
    border: 1px solid rgba(34,211,165,0.25);
    border-radius: var(--radius-sm);
    color: var(--green);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .pay-btn:hover { background: rgba(34,211,165,0.2); box-shadow: 0 0 10px rgba(34,211,165,0.25); }

  .pay-menu-btn {
    width: 26px;
    height: 26px;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .pay-menu-btn:hover { background: var(--bg-overlay); border-color: var(--border); color: var(--text-primary); }

  .pay-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 4px;
    z-index: 300;
    min-width: 168px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.45);
  }
  .pay-menu__item {
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
  .pay-menu__item:hover { background: var(--bg-overlay); color: var(--text-primary); }
  .pay-menu__item--danger:hover { color: var(--red); }
  .pay-menu__divider { height: 1px; background: var(--border); margin: 3px 0; }

  .payment-item__notes {
    font-size: 12px;
    color: var(--text-muted);
    margin: 8px 0 0;
    padding-top: 8px;
    border-top: 1px solid var(--border);
    font-style: italic;
    line-height: 1.5;
  }
`