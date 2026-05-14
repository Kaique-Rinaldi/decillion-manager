// src/components/finance/FinancialRecordCard.jsx
import { useState } from "react"
import FinanceProgressBar from "./FinanceProgressBar"

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)

const BADGE_COLOR = {
  green:  { bg: "rgba(34,201,125,.12)",  color: "#22c97d" },
  amber:  { bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  red:    { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  blue:   { bg: "rgba(79,110,247,.12)",  color: "#4f6ef7" },
  gray:   { bg: "rgba(90,100,120,.15)",  color: "#8892a4" },
}

const STATUS = {
  pending: { label: "Pendente",  badge: "amber" },
  partial: { label: "Parcial",   badge: "blue"  },
  paid:    { label: "Pago",      badge: "green" },
  overdue: { label: "Atrasado",  badge: "red"   },
}

function Badge({ colorKey, label }) {
  const s = BADGE_COLOR[colorKey] ?? BADGE_COLOR.gray
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px",
      borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: "monospace",
      textTransform: "uppercase", letterSpacing: ".3px", background: s.bg, color: s.color,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {label}
    </span>
  )
}

function initials(name = "") {
  return name.trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()
}

const AVATAR_PALETTE = [
  { bg: "rgba(79,110,247,.15)",  fg: "#4f6ef7" },
  { bg: "rgba(167,139,250,.15)", fg: "#a78bfa" },
  { bg: "rgba(34,201,125,.15)",  fg: "#22c97d" },
  { bg: "rgba(245,158,11,.15)",  fg: "#f59e0b" },
  { bg: "rgba(236,72,153,.15)",  fg: "#ec4899" },
]

function avatarColor(name = "") {
  if (!name) return AVATAR_PALETTE[0]
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}

export default function FinancialRecordCard({ record, selected, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const clientName = record.clients?.name || "—"
  const pal = avatarColor(clientName)
  const st = STATUS[record.status] || STATUS.pending
  const pct = record.total_amount > 0
    ? Math.round((record.received_amount / record.total_amount) * 100)
    : 0

  const barColor = {
    paid:    "#22c97d",
    overdue: "#ef4444",
    partial: "#4f6ef7",
    pending: "#f59e0b",
  }[record.status] || "#4f6ef7"

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,2fr) minmax(0,1.5fr) 100px 100px 90px 80px 28px",
        alignItems: "center",
        gap: 0,
        padding: "11px 16px",
        borderBottom: "1px solid rgba(255,255,255,.03)",
        background: selected
          ? "rgba(79,110,247,.07)"
          : hovered
          ? "#161b2a"
          : "transparent",
        cursor: "pointer",
        transition: "background .12s",
        borderLeft: selected ? "2px solid #4f6ef7" : "2px solid transparent",
      }}
    >
      {/* col 1: avatar + client + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: pal.bg, color: pal.fg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700,
        }}>
          {initials(clientName)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 500, color: "#e8eaf0",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {record.title}
          </div>
          <div style={{
            fontSize: 10, color: "#5a6478",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {record.clients?.company || clientName}
          </div>
        </div>
      </div>

      {/* col 2: progress bar */}
      <div style={{ paddingRight: 16 }}>
        <FinanceProgressBar value={pct} color={barColor} height={5} />
        <div style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace", marginTop: 3 }}>
          {pct}%
        </div>
      </div>

      {/* col 3: total */}
      <div style={{
        fontSize: 12, fontWeight: 600, color: "#e8eaf0",
        fontFamily: "monospace", textAlign: "right",
      }}>
        {fmt(record.total_amount)}
      </div>

      {/* col 4: received */}
      <div style={{
        fontSize: 12, fontWeight: 600, color: "#22c97d",
        fontFamily: "monospace", textAlign: "right",
      }}>
        {fmt(record.received_amount)}
      </div>

      {/* col 5: remaining */}
      <div style={{
        fontSize: 12, color: "#f59e0b",
        fontFamily: "monospace", textAlign: "right",
      }}>
        {fmt(record.remaining_amount)}
      </div>

      {/* col 6: badge */}
      <div>
        <Badge colorKey={st.badge} label={st.label} />
      </div>

      {/* col 7: delete */}
      <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            width: 24, height: 24, borderRadius: 5,
            background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)",
            color: "#ef4444", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            opacity: hovered || menuOpen ? 1 : 0, transition: "opacity .15s",
          }}
          title="Excluir"
        >
          ×
        </button>
        {menuOpen && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 4px)",
            background: "#111520", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 8, padding: 4, zIndex: 100, minWidth: 120,
            boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          }}>
            <button
              onClick={() => { setMenuOpen(false); onDelete() }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                width: "100%", padding: "7px 10px",
                border: "none", background: "none",
                fontFamily: "inherit", fontSize: 12,
                color: "#ef4444", borderRadius: 5,
                cursor: "pointer", textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              🗑 Excluir registro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}