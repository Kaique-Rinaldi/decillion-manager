import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <motion.div
        className="confirm-box"
        initial={{ scale: .92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: .92, opacity: 0 }}
        transition={{ duration: .16 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="confirm-icon">🗑</div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-desc">{description}</div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" style={{borderTopColor:'var(--red)'}} /> : 'Deletar'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}