// src/components/finance/FinanceProgressBar.jsx
import { motion } from "framer-motion"

export default function FinanceProgressBar({ value = 0, color = "var(--accent)", height = 6, animated = true }) {
  const clamped = Math.min(Math.max(value, 0), 100)

  return (
    <>
      <div className="progress-track" style={{ height }}>
        <motion.div
          className="progress-fill"
          style={{ background: color, height }}
          initial={animated ? { width: 0 } : { width: `${clamped}%` }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <style>{`
        .progress-track {
          background: var(--bg-overlay);
          border-radius: 99px;
          overflow: hidden;
          width: 100%;
        }
        .progress-fill {
          border-radius: 99px;
        }
      `}</style>
    </>
  )
}