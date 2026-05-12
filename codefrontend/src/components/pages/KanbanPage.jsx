import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import Badge from '../components/shared/Badge'
import TagPill from '../components/shared/TagPill'
import { KANBAN_COLS, KANBAN_COL_KEYS, PAYMENT_STATUS } from '../data/constants'
import { formatCurrency, formatDate, initials, avatarColor, progressBarColor } from '../utils/helpers'
import { updateClient } from '../services/clientsService'

export default function KanbanPage({ addToast }) {
  const { clients, upsertClient } = useAppStore()
  const [draggingId, setDraggingId] = useState(null)
  const [overCol,    setOverCol]    = useState(null)

  function onDragStart(id) { setDraggingId(id) }
  function onDragOver(e, col) { e.preventDefault(); setOverCol(col) }

  async function onDrop(targetCol) {
    setOverCol(null)
    if (!draggingId) return
    const client = clients.find(c => c.id === draggingId)
    if (!client || client.kanbanCol === targetCol) { setDraggingId(null); return }
    const newActivity = {
      id: `a${Date.now()}`, type: 'status',
      text: `Movido para "${KANBAN_COLS[targetCol].label}"`,
      date: new Date().toISOString().split('T')[0], user: 'Sistema',
    }
    const updatedActivities = [...(client.activities || []), newActivity]
    // Optimistic
    upsertClient({ ...client, kanbanCol: targetCol, activities: updatedActivities })
    try {
      const updated = await updateClient(client.id, { kanbanCol: targetCol, activities: updatedActivities })
      upsertClient(updated)
      addToast(`"${client.projectName || client.name}" → ${KANBAN_COLS[targetCol].label}`, 'success')
    } catch {
      upsertClient(client) // rollback
      addToast('Erro ao mover card.', 'error')
    }
    setDraggingId(null)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {KANBAN_COL_KEYS.map(colKey => {
          const col      = KANBAN_COLS[colKey]
          const colItems = clients.filter(c => (c.kanbanCol || 'backlog') === colKey)
          const isOver   = overCol === colKey
          return (
            <div
              key={colKey}
              onDragOver={e => onDragOver(e, colKey)}
              onDragLeave={() => setOverCol(null)}
              onDrop={() => onDrop(colKey)}
              style={{
                background: isOver ? col.color + '12' : '#111520',
                border: `1px solid ${isOver ? col.color + '50' : 'rgba(255,255,255,.06)'}`,
                borderRadius: 12, padding: 12, minHeight: 200, transition: 'all .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: col.color, fontFamily: 'monospace',
                    textTransform: 'uppercase', letterSpacing: '.4px' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4,
                  background: col.color + '18', color: col.color, fontFamily: 'monospace' }}>{colItems.length}</span>
              </div>

              <AnimatePresence>
                {colItems.map(c => {
                  const pal      = avatarColor(c.name)
                  const barColor = progressBarColor(c.projectStatus)
                  const ps       = PAYMENT_STATUS[c.paymentStatus] ?? PAYMENT_STATUS.pendente
                  return (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .95 }}
                      draggable onDragStart={() => onDragStart(c.id)}
                      style={{
                        background: '#161b2a', border: '1px solid rgba(255,255,255,.07)',
                        borderRadius: 10, padding: 10, marginBottom: 8, cursor: 'grab',
                        opacity: draggingId === c.id ? .4 : 1, transition: 'opacity .1s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: pal.bg, color: pal.fg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{initials(c.name)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: '#e8eaf0',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.projectName || c.name}
                          </div>
                          <div style={{ fontSize: 9, color: '#5a6478' }}>{c.name}</div>
                        </div>
                      </div>
                      <div style={{ height: 3, background: '#1c2236', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ height: '100%', background: barColor, borderRadius: 4,
                          width: `${c.projectProgress || 0}%`, transition: 'width .4s' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Badge colorKey={ps.badge} label={ps.label} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 9, color: '#5a6478', fontFamily: 'monospace' }}>{c.projectProgress || 0}%</span>
                          <span style={{ fontSize: 9, color: '#22c97d', fontFamily: 'monospace', fontWeight: 600 }}>
                            {formatCurrency(c.projectValue)}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 9, color: '#5a6478', fontFamily: 'monospace' }}>
                        ◎ {c.projectOwner || '—'} · {formatDate(c.endDate)}
                      </div>
                      {(c.tags || []).length > 0 && (
                        <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
                          {c.tags.map(t => <TagPill key={t} label={t} />)}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {colItems.length === 0 && (
                <div style={{ textAlign: 'center', color: '#3a4255', fontSize: 11, padding: '24px 0',
                  border: '1px dashed rgba(255,255,255,.05)', borderRadius: 8 }}>
                  Arraste um card aqui
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}