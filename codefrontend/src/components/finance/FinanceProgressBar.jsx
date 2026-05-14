// src/components/finance/FinanceProgressBar.jsx
import { motion } from "framer-motion"

const STATUS_COLOR = {
  pending: "#f59e0b",
  partial: "#4f6ef7",
  paid:    "#22c97d",
  overdue: "#ef4444",
}

export default function FinanceProgressBar({ progress = 0, status = "pending", animate = true }) {
  const color = STATUS_COLOR[status] ?? "#4f6ef7"
  const pct   = Math.min(Math.max(Number(progress) || 0, 0), 100)

  return (
    <div style={{ width: "100%" }}>
      {/* Labels */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 6,
      }}>
        <span style={{
          fontSize: 9, fontFamily: "monospace", textTransform: "uppercase",
          letterSpacing: ".6px", color: "#5a6478",
        }}>
          Progresso Financeiro
        </span>
        <span style={{
          fontSize: 11, fontFamily: "monospace", fontWeight: 700,
          color,
        }}>
          {pct.toFixed(1)}%
        </span>
      </div>

      {/* Track */}
      <div style={{
        width: "100%", height: 6, borderRadius: 99,
        background: "rgba(255,255,255,.06)", overflow: "hidden",
        position: "relative",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: animate ? .9 : 0, ease: [.22, 1, .36, 1] }}
          style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
            position: "relative",
          }}
        >
          {/* Shimmer */}
          {pct > 0 && pct < 100 && (
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)",
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}