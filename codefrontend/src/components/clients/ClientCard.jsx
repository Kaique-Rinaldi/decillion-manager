import { motion } from 'framer-motion'
import { formatCurrency, formatDate, initials, avatarPalette, daysLeft } from '../../utils/helpers'
import { PAYMENT_STATUS, PROJECT_STATUS } from '../../data/mockData'

// ─── ClientCard ───────────────────────────────────────────────────────────────
export default function ClientCard({ client, onEdit, onDelete, index }) {
  const pal = avatarPalette(client.name)
  const pStatus  = PAYMENT_STATUS[client.paymentStatus]
  const prStatus = PROJECT_STATUS[client.projectStatus]
  const remaining = daysLeft(client.endDate)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .97 }}
      transition={{ duration: .2, delay: index * .03 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column', gap: 14,
        cursor: 'default',
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: pal.bg, color: pal.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700,
        }}>
          {initials(client.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {client.name}
          </div>
          {client.company && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{client.company}</div>
          )}
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button className="btn-icon" onClick={() => onEdit(client)} title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="btn-icon" onClick={() => onDelete(client)} title="Deletar"
            style={{ color: 'var(--red)', borderColor: '#fca5a5', background: 'var(--red-bg)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--red-bg)'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)' }}>
          <span>✉</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {client.email}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)' }}>
          <span>📞</span>
          <span>{client.phone}</span>
        </div>
      </div>

      {/* Value */}
      <div style={{
        background: 'var(--bg)', borderRadius: 'var(--radius)',
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase',
            letterSpacing: '.5px', fontWeight: 600, marginBottom: 2 }}>Valor</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)',
            letterSpacing: '-0.5px', fontFamily: 'var(--mono)' }}>
            {formatCurrency(client.projectValue)}
          </div>
        </div>
        <span className={`badge ${pStatus?.badge ?? 'badge-gray'}`}>
          {pStatus?.label}
        </span>
      </div>

      {/* Dates */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>
            Início
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
            {formatDate(client.startDate)}
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>
            Entrega
          </div>
          <div style={{ fontSize: 12, fontWeight: 600,
            color: remaining !== null && remaining < 0 ? 'var(--red)' : 'var(--text2)',
            fontFamily: 'var(--mono)' }}>
            {formatDate(client.endDate)}
          </div>
        </div>
      </div>

      {/* Project status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`badge ${prStatus?.badge ?? 'badge-gray'}`}>
          {prStatus?.label}
        </span>
        {remaining !== null && client.projectStatus === 'andamento' && (
          <span style={{
            fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 500,
            color: remaining < 0 ? 'var(--red)' : remaining <= 7 ? 'var(--amber)' : 'var(--text3)',
          }}>
            {remaining < 0 ? `${Math.abs(remaining)}d atrasado` : `${remaining}d restantes`}
          </span>
        )}
      </div>

      {/* Notes */}
      {client.notes && (
        <div style={{
          fontSize: 11, color: 'var(--text3)', lineHeight: 1.5,
          paddingTop: 10, borderTop: '1px solid var(--border)',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {client.notes}
        </div>
      )}
    </motion.div>
  )
}