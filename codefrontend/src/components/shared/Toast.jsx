import { AnimatePresence, motion } from 'framer-motion'

const TOAST_COLORS = {
  success: { bg: 'rgba(34,201,125,.12)',  border: 'rgba(34,201,125,.25)',  color: '#22c97d', icon: '✓' },
  error:   { bg: 'rgba(239,68,68,.12)',   border: 'rgba(239,68,68,.25)',   color: '#ef4444', icon: '✕' },
  warning: { bg: 'rgba(245,158,11,.12)',  border: 'rgba(245,158,11,.25)',  color: '#f59e0b', icon: '⚠' },
  info:    { bg: 'rgba(79,110,247,.12)',  border: 'rgba(79,110,247,.25)',  color: '#4f6ef7', icon: 'ℹ' },
}

function Toast({ toast, onRemove }) {
  const style = TOAST_COLORS[toast.type] ?? TOAST_COLORS.info
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: .95 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      exit={{    opacity: 0, y: 16, scale: .95 }}
      transition={{ duration: .18 }}
      onClick={() => onRemove(toast.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 10,
        background: style.bg, border: `1px solid ${style.border}`,
        cursor: 'pointer', minWidth: 220, maxWidth: 340,
        boxShadow: '0 8px 24px rgba(0,0,0,.4)',
      }}>
      <span style={{ color: style.color, fontSize: 13, flexShrink: 0 }}>{style.icon}</span>
      <span style={{ fontSize: 12, color: '#e8eaf0', flex: 1, fontFamily: "'DM Sans',sans-serif" }}>
        {toast.message}
      </span>
    </motion.div>
  )
}

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      <AnimatePresence>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <Toast toast={t} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}