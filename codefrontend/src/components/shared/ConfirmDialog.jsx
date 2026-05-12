import { motion } from 'framer-motion'

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: .9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: .9, opacity: 0 }}
        transition={{ duration: .16 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111520', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 14, padding: 28, maxWidth: 360, width: '100%',
          textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.5)',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#e8eaf0', marginBottom: 8 }}>
          {title ?? 'Deletar?'}
        </div>
        <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 24, lineHeight: 1.6 }}>
          {description ?? 'Esta ação não pode ser desfeita.'}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.1)',
              color: '#8892a4', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: 'rgba(239,68,68,.15)',
              border: '1px solid rgba(239,68,68,.3)',
              color: '#ef4444', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {loading && (
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                border: '2px solid rgba(239,68,68,.3)', borderTopColor: '#ef4444',
                animation: 'spin .6s linear infinite',
              }} />
            )}
            Deletar
          </button>
        </div>
      </motion.div>
    </div>
  )
}