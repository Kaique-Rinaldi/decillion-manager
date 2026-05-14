// src/components/finance/PaymentActionsDropdown.jsx
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

function Icon({ d, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function PaymentActionsDropdown({
  payment,
  onView,
  onMarkPaid,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const isPending = payment.status === "pending" || payment.status === "pendente"
  const isOverdue = payment.status === "overdue"  || payment.status === "atrasado"
  const isPaid    = payment.status === "paid"     || payment.status === "pago"

  const items = [
    {
      label: "Ver detalhes",
      icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
      action: onView,
    },
    (isPending || isOverdue) && {
      label: "Marcar como pago",
      icon: "M20 6L9 17l-5-5",
      action: onMarkPaid,
      accent: "#22c97d",
    },
    {
      label: "Editar pagamento",
      icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
      action: onEdit,
    },
    {
      label: "Duplicar",
      icon: "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z",
      action: onDuplicate,
    },
    isPaid && {
      label: "Gerar comprovante",
      icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
      action: () => {},
    },
    "separator",
    {
      label: "Excluir",
      icon: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
      action: onDelete,
      accent: "#ef4444",
    },
  ].filter(Boolean)

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        style={{
          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 6, border: "1px solid rgba(255,255,255,.08)", background: "transparent",
          color: "#5a6478", cursor: "pointer", transition: "all .13s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#1c2236"; e.currentTarget.style.color = "#e8eaf0" }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5a6478" }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="7" cy="2" r="1.3" />
          <circle cx="7" cy="7" r="1.3" />
          <circle cx="7" cy="12" r="1.3" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: .95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .95, y: -4 }}
            transition={{ duration: .12 }}
            style={{
              position: "absolute", right: 0, top: 34, zIndex: 200,
              width: 200, background: "#111520",
              border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
              boxShadow: "0 16px 48px rgba(0,0,0,.5)", padding: "4px 0",
            }}
          >
            {items.map((item, i) =>
              item === "separator"
                ? <div key={i} style={{ margin: "4px 0", borderTop: "1px solid rgba(255,255,255,.06)" }} />
                : (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); item.action?.(); setOpen(false) }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 9,
                      padding: "8px 12px", background: "none", border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                      color: item.accent || "#8892a4", textAlign: "left", transition: "all .1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#161b2a"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <Icon d={item.icon} size={12} />
                    {item.label}
                  </button>
                )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}