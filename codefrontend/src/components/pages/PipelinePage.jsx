import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import Badge from '../components/shared/Badge'
import StatCard from '../components/shared/StatCard'
import { PIPELINE_STAGE, PIPELINE_STAGE_KEYS, ALLOWED_TRANSITIONS } from '../data/constants'
import { formatCurrency, formatDate } from '../utils/helpers'
import { updateDeal } from '../services/dealsService'

export default function PipelinePage({ addToast, userId }) {
  const { deals, upsertDeal } = useAppStore()
  const [draggingId, setDraggingId] = useState(null)
  const [overStage,  setOverStage]  = useState(null)

  const totalValue = deals.reduce((s, d) => s + d.value, 0)
  const openDeals  = deals.filter(d => d.stage !== 'fechado')
  const avgTicket  = openDeals.length > 0 ? openDeals.reduce((s, d) => s + d.value, 0) / openDeals.length : 0

  function onDragStart(id) { setDraggingId(id) }
  function onDragOver(e, stageKey) { e.preventDefault(); setOverStage(stageKey) }

  async function onDrop(targetStage) {
    setOverStage(null)
    if (!draggingId) return
    const deal = deals.find(d => d.id === draggingId)
    if (!deal || deal.stage === targetStage) { setDraggingId(null); return }
    const allowed = ALLOWED_TRANSITIONS?.[deal.stage] ?? []
    if (!allowed.includes(targetStage)) {
      addToast(`Transição "${PIPELINE_STAGE[deal.stage].label}" → "${PIPELINE_STAGE[targetStage].label}" não permitida.`, 'error')
      setDraggingId(null); return
    }
    const closedAt = targetStage === 'fechado' ? new Date().toISOString().split('T')[0] : null
    // Optimistic
    upsertDeal({ ...deal, stage: targetStage, closedAt })
    try {
      const updated = await updateDeal(deal.id, { stage: targetStage, closedAt })
      upsertDeal(updated)
      addToast(`Negociação movida para "${PIPELINE_STAGE[targetStage].label}"`, 'success')
    } catch {
      upsertDeal(deal) // rollback
      addToast('Erro ao mover negociação.', 'error')
    }
    setDraggingId(null)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 20 }}>
        {PIPELINE_STAGE_KEYS.map(stageKey => {
          const stage      = PIPELINE_STAGE[stageKey]
          const stageDeals = deals.filter(d => d.stage === stageKey)
          const isOver     = overStage === stageKey
          return (
            <div
              key={stageKey}
              onDragOver={e => onDragOver(e, stageKey)}
              onDragLeave={() => setOverStage(null)}
              onDrop={() => onDrop(stageKey)}
              style={{
                background: isOver ? stage.color + '14' : '#111520',
                border: `1px solid ${isOver ? stage.color + '60' : 'rgba(255,255,255,.06)'}`,
                borderRadius: 10, padding: 10, minHeight: 120, transition: 'all .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '.5px', fontFamily: 'monospace', color: stage.color }}>{stage.label}</div>
                <div style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4,
                  background: stage.color + '18', color: stage.color, fontFamily: 'monospace' }}>
                  {stageDeals.length}
                </div>
              </div>
              <AnimatePresence>
                {stageDeals.map(d => (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .95 }}
                    draggable onDragStart={() => onDragStart(d.id)}
                    style={{
                      background: '#161b2a', border: '1px solid rgba(255,255,255,.06)',
                      borderRadius: 8, padding: 8, marginBottom: 6, cursor: 'grab',
                      opacity: draggingId === d.id ? .45 : 1,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#e8eaf0', marginBottom: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                    <div style={{ fontSize: 10, color: '#5a6478', marginBottom: 6 }}>{d.company}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#22c97d', fontFamily: 'monospace' }}>
                      {formatCurrency(d.value)}
                    </div>
                    <div style={{ fontSize: 8, color: '#5a6478', fontFamily: 'monospace', marginTop: 4, textAlign: 'right' }}>
                      {formatDate(d.createdAt)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <StatCard label="Valor total pipeline" value={formatCurrency(totalValue)} />
        <StatCard label="Ticket médio"          value={formatCurrency(avgTicket)} />
        <StatCard label="Negociações em aberto" value={openDeals.length} />
      </div>
    </div>
  )
}