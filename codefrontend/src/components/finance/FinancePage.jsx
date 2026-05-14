// src/components/finance/FinancePage.jsx
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import { useFinance } from "../../hooks/useFinance"
import FinanceStats from "./FinanceStats"
import FinanceFilters from "./FinanceFilters"
import FinancialRecordList from "./FinancialRecordList"
import FinanceDrawer from "./FinanceDrawer"
import NewFinancialRecordModal from "./NewFinancialRecordModal"

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
}

export default function FinancePage({ addToast }) {
  const {
    records, stats, loading, filters, setFilters,
    reload, createRecord, updateRecord, removeRecord, refreshRecord,
  } = useFinance(addToast)

  const [selectedRecord, setSelectedRecord] = useState(null)
  const [drawerOpen,     setDrawerOpen]     = useState(false)
  const [modalOpen,      setModalOpen]      = useState(false)

  const openDrawer = (record) => {
    setSelectedRecord(record)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => setSelectedRecord(null), 300)
  }

  const handleRecordUpdated = (updatedRecord) => {
    refreshRecord(updatedRecord)
    if (selectedRecord?.id === updatedRecord.id) {
      setSelectedRecord(updatedRecord)
    }
  }

  const handleCreate = async (payload) => {
    const rec = await createRecord(payload)
    if (rec) setModalOpen(false)
  }

  return (
    <>
      <div className="finance-page">
        {/* ── Header ────────────────────────────────────────── */}
        <motion.div
          className="finance-header"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="finance-header__text">
            <h1 className="finance-title">Financeiro</h1>
            <p className="finance-subtitle">Visão geral das receitas e pagamentos</p>
          </motion.div>

          <motion.button
            variants={fadeUp}
            className="btn-primary"
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} />
            Novo registro
          </motion.button>
        </motion.div>

        {/* ── Stats ─────────────────────────────────────────── */}
        <FinanceStats stats={stats} loading={loading} />

        {/* ── Filters ───────────────────────────────────────── */}
        <FinanceFilters filters={filters} onChange={setFilters} />

        {/* ── List ──────────────────────────────────────────── */}
        <FinancialRecordList
          records={records}
          loading={loading}
          onSelect={openDrawer}
          onDelete={removeRecord}
          selectedId={selectedRecord?.id}
        />
      </div>

      {/* ── Drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && selectedRecord && (
          <FinanceDrawer
            record={selectedRecord}
            onClose={closeDrawer}
            onRecordUpdated={handleRecordUpdated}
            onDelete={(id) => { removeRecord(id); closeDrawer() }}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* ── New Record Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <NewFinancialRecordModal
            onClose={() => setModalOpen(false)}
            onCreate={handleCreate}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      <style>{pageStyles}</style>
    </>
  )
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg-base:      #0a0a0f;
    --bg-surface:   #111118;
    --bg-elevated:  #18181f;
    --bg-overlay:   #1f1f29;
    --border:       rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.13);
    --text-primary: #f0f0f6;
    --text-secondary: #8888a0;
    --text-muted:   #55556a;
    --accent:       #6c63ff;
    --accent-dim:   rgba(108,99,255,0.15);
    --accent-glow:  rgba(108,99,255,0.35);
    --green:        #22d3a5;
    --green-dim:    rgba(34,211,165,0.12);
    --amber:        #f59e0b;
    --amber-dim:    rgba(245,158,11,0.12);
    --red:          #f43f5e;
    --red-dim:      rgba(244,63,94,0.12);
    --blue:         #38bdf8;
    --blue-dim:     rgba(56,189,248,0.12);
    --radius-sm:    6px;
    --radius-md:    12px;
    --radius-lg:    18px;
    --radius-xl:    24px;
    --font-display: 'Syne', sans-serif;
    --font-body:    'DM Sans', sans-serif;
  }

  .finance-page {
    font-family: var(--font-body);
    background: var(--bg-base);
    min-height: 100vh;
    padding: 40px 48px;
    color: var(--text-primary);
  }

  .finance-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 36px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .finance-title {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--text-primary);
    margin: 0 0 4px;
    line-height: 1;
  }

  .finance-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 300;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    padding: 10px 20px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 0 24px var(--accent-glow);
    transition: box-shadow 0.2s, background 0.2s;
  }
  .btn-primary:hover {
    background: #7c74ff;
    box-shadow: 0 0 36px var(--accent-glow);
  }

  @media (max-width: 768px) {
    .finance-page { padding: 20px 16px; }
    .finance-title { font-size: 24px; }
  }
`