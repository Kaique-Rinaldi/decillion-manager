// src/components/finance/FinanceProgressBar.jsx
import { motion } from "framer-motion"

export default function FinanceProgressBar({ value = 0, color = "#4f6ef7", height = 5, animated = true }) {
  const clamped = Math.min(Math.max(value, 0), 100)
  return (
    <div style={{
      background: "#1c2236", borderRadius: 4, overflow: "hidden",
      height, width: "100%",
    }}>
      <motion.div
        style={{ background: color, height, borderRadius: 4 }}
        initial={animated ? { width: 0 } : { width: `${clamped}%` }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}