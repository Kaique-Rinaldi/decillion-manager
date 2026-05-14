// src/components/finance/FinancialRecordList.jsx
import { motion, AnimatePresence } from "framer-motion"
import FinancialRecordCard from "./FinancialRecordCard"
import { FileText } from "lucide-react"

export default function FinancialRecordList({ records, loading, onSelect, onDelete, selectedId }) {
  if (loading) {
    return (
      <div className="record-list">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        <style>{listCss}</style>
      </div>
    )
  }

  if (!records.length) {
    return (
      <>
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-state__icon">
            <FileText size={28} color="var(--text-muted)" />
          </div>
          <p className="empty-state__title">Nenhum registro encontrado</p>
          <p className="empty-state__sub">Crie um novo registro financeiro para começar.</p>
        </motion.div>
        <style>{listCss}</style>
      </>
    )
  }

  return (
    <>
      <div className="record-list">
        <AnimatePresence mode="popLayout">
          {records.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35, ease: [0.22,1,0.36,1] } }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
              layout
            >
              <FinancialRecordCard
                record={record}
                selected={selectedId === record.id}
                onSelect={() => onSelect(record)}
                onDelete={() => onDelete(record.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <style>{listCss}</style>
    </>
  )
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton--avatar" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton--line skeleton--w60" />
        <div className="skeleton skeleton--line skeleton--w40" style={{ marginTop: 6 }} />
      </div>
      <div className="skeleton-card__progress">
        <div className="skeleton skeleton--bar" />
      </div>
      <div className="skeleton skeleton--badge" />
    </div>
  )
}

const listCss = `
  .record-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
  }
  .empty-state__icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  .empty-state__title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 6px;
  }
  .empty-state__sub {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }

  .skeleton-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .skeleton-card__body { flex: 1; }
  .skeleton-card__progress { width: 180px; }

  .skeleton--avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
  .skeleton--line   { height: 13px; border-radius: 4px; }
  .skeleton--w60    { width: 60%; }
  .skeleton--w40    { width: 40%; }
  .skeleton--bar    { height: 6px; border-radius: 99px; width: 100%; }
  .skeleton--badge  { height: 24px; width: 72px; border-radius: 99px; flex-shrink: 0; }
`