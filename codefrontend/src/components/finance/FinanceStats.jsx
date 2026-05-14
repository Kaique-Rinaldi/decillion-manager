// src/components/finance/FinanceStats.jsx
import { motion } from "framer-motion"
import { DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react"

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)

const cards = (stats) => [
  {
    label:   "Receita total",
    value:   fmt(stats?.totalRevenue),
    sub:     `${stats?.countRecords ?? 0} registros`,
    icon:    DollarSign,
    color:   "var(--accent)",
    glow:    "var(--accent-glow)",
    dimBg:   "var(--accent-dim)",
  },
  {
    label:   "Recebido",
    value:   fmt(stats?.totalReceived),
    sub:     `${stats?.countPaid ?? 0} pagos`,
    icon:    TrendingUp,
    color:   "var(--green)",
    glow:    "rgba(34,211,165,0.3)",
    dimBg:   "var(--green-dim)",
  },
  {
    label:   "Pendências",
    value:   fmt(stats?.totalPending),
    sub:     `${stats?.countPending ?? 0} registros`,
    icon:    Clock,
    color:   "var(--amber)",
    glow:    "rgba(245,158,11,0.28)",
    dimBg:   "var(--amber-dim)",
  },
  {
    label:   "Inadimplência",
    value:   fmt(stats?.totalOverdue),
    sub:     `${stats?.countOverdue ?? 0} em atraso`,
    icon:    AlertTriangle,
    color:   "var(--red)",
    glow:    "rgba(244,63,94,0.28)",
    dimBg:   "var(--red-dim)",
  },
]

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export default function FinanceStats({ stats, loading }) {
  return (
    <>
      <motion.div
        className="stats-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {cards(stats).map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              className="stat-card"
              variants={item}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              style={{ "--card-color": card.color, "--card-glow": card.glow, "--card-dim": card.dimBg }}
            >
              <div className="stat-card__icon">
                <Icon size={18} color={card.color} />
              </div>
              <div className="stat-card__body">
                <p className="stat-card__label">{card.label}</p>
                {loading ? (
                  <div className="skeleton skeleton--value" />
                ) : (
                  <p className="stat-card__value">{card.value}</p>
                )}
                <p className="stat-card__sub">{card.sub}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <style>{css}</style>
    </>
  )
}

const css = `
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    cursor: default;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover {
    border-color: var(--card-color, var(--border-hover));
    box-shadow: 0 0 28px var(--card-glow, transparent);
  }

  .stat-card__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--card-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-card__body { flex: 1; min-width: 0; }

  .stat-card__label {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0 0 6px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-card__value {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px;
    letter-spacing: -0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stat-card__sub {
    font-size: 11px;
    color: var(--text-muted);
    margin: 0;
  }

  .skeleton {
    background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 4px;
  }
  .skeleton--value { height: 28px; width: 110px; margin-bottom: 4px; }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr; }
  }
`