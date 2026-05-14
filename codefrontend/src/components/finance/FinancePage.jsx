// src/components/finance/FinancePage.jsx
import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useFinance } from "../../hooks/useFinance"
import FinanceDrawer from "./FinanceDrawer"
import NewFinancialRecordModal from "./NewFinancialRecordModal"
import FinancialRecordCard from "./FinancialRecordCard"

// ─── shared primitives (mirrors App.jsx) ───────────────────────
const BADGE_COLOR = {
  green:  { bg: "rgba(34,201,125,.12)",  color: "#22c97d" },
  amber:  { bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  red:    { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  blue:   { bg: "rgba(79,110,247,.12)",  color: "#4f6ef7" },
  purple: { bg: "rgba(167,139,250,.12)", color: "#a78bfa" },
  gray:   { bg: "rgba(90,100,120,.15)",  color: "#8892a4" },
}

function StatCard({ label, value, sub, colorKey = "blue" }) {
  const c = BADGE_COLOR[colorKey]
  return (
    <div style={{
      background: "#111520", border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 12, padding: 16,
    }}>
      <div style={{
        fontSize: 9, color: "#5a6478", textTransform: "uppercase",
        letterSpacing: ".8px", fontFamily: "monospace", marginBottom: 8,
      }}>{label}</div>
      <div style={{
        fontSize: 20, fontWeight: 600, color: "#e8eaf0",
        letterSpacing: -0.5, fontFamily: "monospace",
      }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 10, color: "#5a6478", marginTop: 4, fontFamily: "monospace" }}>{sub}</div>
      )}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, color: "#5a6478", textTransform: "uppercase",
      letterSpacing: ".8px", fontFamily: "monospace", marginBottom: 10,
    }}>{children}</div>
  )
}

// ─── filter tabs ────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "all",     label: "Todos"     },
  { key: "pending", label: "Pendentes" },
  { key: "partial", label: "Parcial"   },
  { key: "paid",    label: "Pagos"     },
  { key: "overdue", label: "Atrasados" },
]

// ─── format helpers ─────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)

// ─── main page ──────────────────────────────────────────────────
export default function FinancePage({ addToast }) {
  const {
    records, stats, loading, filters, setFilters,
    createRecord, updateRecord, removeRecord, refreshRecord,
  } = useFinance(addToast)

  const [selectedRecord, setSelectedRecord] = useState(null)
  const [drawerOpen,     setDrawerOpen]     = useState(false)
  const [modalOpen,      setModalOpen]      = useState(false)
  const [searchRaw,      setSearchRaw]      = useState("")

  // client-side search (avoids re-fetching on every keystroke)
  const filtered = useMemo(() => {
    const q = searchRaw.trim().toLowerCase()
    if (!q) return records
    return records.filter(r =>
      r.title?.toLowerCase().includes(q) ||
      r.clients?.name?.toLowerCase().includes(q) ||
      r.clients?.company?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    )
  }, [records, searchRaw])

  const openDrawer = (record) => {
    setSelectedRecord(record)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => setSelectedRecord(null), 300)
  }

  const handleRecordUpdated = (updated) => {
    refreshRecord(updated)
    if (selectedRecord?.id === updated.id) setSelectedRecord(updated)
  }

  const handleCreate = async (payload) => {
    const rec = await createRecord(payload)
    if (rec) setModalOpen(false)
  }

  const handleDelete = async (id) => {
    await removeRecord(id)
    if (selectedRecord?.id === id) closeDrawer()
  }

  // chip style mirrors App.jsx
  const chipStyle = (active) => ({
    padding: "4px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer",
    border: "1px solid", fontFamily: "inherit", transition: "all .13s",
    borderColor: active ? "#4f6ef7" : "rgba(255,255,255,.1)",
    background: active ? "#4f6ef7" : "transparent",
    color: active ? "#fff" : "#8892a4",
  })

  return (
    <div style={{ padding: 24 }}>

      {/* ── Stats ───────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 12, marginBottom: 20,
      }}>
        <StatCard
          label="Receita total"
          value={fmt(stats?.totalRevenue)}
          sub={`${stats?.countRecords ?? 0} registros`}
          colorKey="blue"
        />
        <StatCard
          label="Recebido"
          value={fmt(stats?.totalReceived)}
          sub={`${stats?.countPaid ?? 0} pagos`}
          colorKey="green"
        />
        <StatCard
          label="Pendências"
          value={fmt(stats?.totalPending)}
          sub={`${stats?.countPending ?? 0} registros`}
          colorKey="amber"
        />
        <StatCard
          label="Inadimplência"
          value={fmt(stats?.totalOverdue)}
          sub={`${stats?.countOverdue ?? 0} em atraso`}
          colorKey="red"
        />
      </div>

      {/* ── Filters + actions ───────────────────────────── */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 14,
        alignItems: "center", flexWrap: "wrap",
      }}>
        {/* search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#161b2a", border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 7, padding: "6px 10px", flex: 1, minWidth: 200,
        }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
            stroke="#5a6478" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
          <input
            value={searchRaw}
            onChange={e => setSearchRaw(e.target.value)}
            placeholder="Buscar por cliente, título, descrição…"
            style={{
              background: "none", border: "none", outline: "none",
              fontSize: 12, color: "#e8eaf0", fontFamily: "inherit", width: "100%",
            }}
          />
          {searchRaw && (
            <button onClick={() => setSearchRaw("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#5a6478", fontSize: 16, lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>

        {/* new record */}
        <button
          onClick={() => setModalOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
            borderRadius: 7, background: "#4f6ef7", border: "none",
            color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit", flexShrink: 0,
          }}
        >
          + Novo registro
        </button>
      </div>

      {/* ── Filter chips ────────────────────────────────── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace" }}>STATUS:</span>
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            style={chipStyle(filters.status === key)}
            onClick={() => setFilters(f => ({ ...f, status: key }))}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Record list ─────────────────────────────────── */}
      {loading ? (
        <div style={{
          background: "#111520", border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 12, overflow: "hidden",
        }}>
          {[1,2,3,4].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "#111520", border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 12, padding: "48px 0", textAlign: "center",
          color: "#5a6478", fontSize: 13,
        }}>
          {records.length === 0
            ? "Nenhum registro financeiro ainda. Clique em \"+ Novo registro\" para começar."
            : "Nenhum resultado para os filtros aplicados."}
        </div>
      ) : (
        <div style={{
          background: "#111520", border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 12, overflow: "hidden",
        }}>
          {/* table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,1.5fr) 100px 100px 90px 80px 28px",
            gap: 0,
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,.05)",
          }}>
            {["Cliente / Título", "Progresso", "Total", "Recebido", "Restante", "Status", ""].map((h, i) => (
              <div key={i} style={{
                fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: ".8px", color: "#5a6478", fontFamily: "monospace",
                textAlign: i >= 2 && i <= 4 ? "right" : "left",
              }}>{h}</div>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.2 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                layout
              >
                <FinancialRecordCard
                  record={record}
                  selected={selectedRecord?.id === record.id}
                  onSelect={() => openDrawer(record)}
                  onDelete={() => handleDelete(record.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Drawer ──────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && selectedRecord && (
          <FinanceDrawer
            record={selectedRecord}
            onClose={closeDrawer}
            onRecordUpdated={handleRecordUpdated}
            onDelete={handleDelete}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* ── New Record Modal ─────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <NewFinancialRecordModal
            onClose={() => setModalOpen(false)}
            onCreate={handleCreate}
            addToast={addToast}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "minmax(0,2fr) minmax(0,1.5fr) 100px 100px 90px 80px 28px",
      gap: 0, padding: "12px 16px",
      borderBottom: "1px solid rgba(255,255,255,.03)",
    }}>
      {[120, 140, 70, 70, 60, 55, 20].map((w, i) => (
        <div key={i} style={{
          height: 12, borderRadius: 6, width: w,
          background: "linear-gradient(90deg, #1c2236 25%, #252d42 50%, #1c2236 75%)",
          backgroundSize: "400% 100%",
          animation: "shimmer 1.4s ease infinite",
          marginLeft: i >= 2 && i <= 4 ? "auto" : 0,
        }} />
      ))}
      <style>{`@keyframes shimmer { to { background-position: -400% 0; } }`}</style>
    </div>
  )
}