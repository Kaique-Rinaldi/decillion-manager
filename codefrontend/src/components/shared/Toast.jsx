import { AnimatePresence, motion } from 'framer-motion'

// ─── ICONS ────────────────────────────────────────────────────────────────────
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M20 6L9 17l-5-5"/></svg>
}
function IconX() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M18 6L6 18M6 6l12 12"/></svg>
}
function IconWarn() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
}

const ICONS = { success: <IconCheck />, error: <IconX />, warning: <IconWarn /> }

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            className={`toast ${t.type}`}
            initial={{ opacity: 0, y: 16, scale: .95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: .95 }}
            transition={{ duration: .18 }}
            onClick={() => removeToast(t.id)}
            style={{ cursor: 'pointer' }}
          >
            <span style={{ flexShrink: 0 }}>{ICONS[t.type] ?? ICONS.success}</span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}