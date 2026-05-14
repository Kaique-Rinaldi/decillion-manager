// src/components/finance/FinanceFilters.jsx
import { useState } from "react"
import { motion } from "framer-motion"
import { Search, SlidersHorizontal } from "lucide-react"

const TABS = [
  { key: "all",     label: "Todos" },
  { key: "pending", label: "Pendentes" },
  { key: "partial", label: "Parcial" },
  { key: "paid",    label: "Pagos" },
  { key: "overdue", label: "Atrasados" },
]

export default function FinanceFilters({ filters, onChange }) {
  const [searchFocused, setSearchFocused] = useState(false)

  const setStatus = (s) => onChange({ ...filters, status: s })
  const setSearch = (v) => onChange({ ...filters, search: v })

  return (
    <>
      <div className="filters-row">
        {/* Status tabs */}
        <div className="filter-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab ${filters.status === tab.key ? "filter-tab--active" : ""}`}
              onClick={() => setStatus(tab.key)}
            >
              {filters.status === tab.key && (
                <motion.span
                  className="filter-tab__bg"
                  layoutId="filter-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="filter-tab__label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search + Advanced */}
        <div className="filter-actions">
          <div className={`search-box ${searchFocused ? "search-box--focused" : ""}`}>
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar registros..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="search-input"
            />
          </div>

          <button className="btn-icon" title="Filtros avançados">
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>

      <style>{css}</style>
    </>
  )
}

const css = `
  .filters-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .filter-tabs {
    display: flex;
    gap: 4px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 4px;
  }

  .filter-tab {
    position: relative;
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    padding: 6px 14px;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.2s;
    overflow: hidden;
  }
  .filter-tab:hover { color: var(--text-primary); }
  .filter-tab--active { color: var(--text-primary); font-weight: 500; }

  .filter-tab__bg {
    position: absolute;
    inset: 0;
    background: var(--bg-overlay);
    border-radius: var(--radius-sm);
    z-index: 0;
  }
  .filter-tab__label { position: relative; z-index: 1; }

  .filter-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-box--focused {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  .search-icon { color: var(--text-muted); flex-shrink: 0; }

  .search-input {
    background: none;
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--text-primary);
    width: 200px;
    padding: 9px 0;
  }
  .search-input::placeholder { color: var(--text-muted); }

  .btn-icon {
    width: 36px;
    height: 36px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-icon:hover { color: var(--text-primary); border-color: var(--border-hover); }

  @media (max-width: 640px) {
    .filter-tabs { order: 2; width: 100%; overflow-x: auto; }
    .filter-actions { order: 1; width: 100%; }
    .search-input { width: 100%; }
    .search-box { flex: 1; }
  }
`