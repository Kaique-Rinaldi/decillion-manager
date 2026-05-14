// src/components/pages/ProjectFinancePage.jsx
// Página contextual: Cliente → Projeto → Financeiro
// Wires: useProjectFinance hook + ProjectFinanceOverview + PaymentDrawer

import { useState, useCallback } from "react"
import { useProjectFinance }       from "../../hooks/useProjectFinance"
import ProjectFinanceOverview      from "../finance/ProjectFinanceOverview"
import PaymentDrawer               from "../finance/PaymentDrawer"

export default function ProjectFinancePage({ project, client, addToast }) {
  const {
    finance,
    payments,
    loading,
    setupFinance,
    updateFinance,
    addPayment,
    editPayment,
    markPaid,
    removePayment,
    duplicatePayment,
  } = useProjectFinance(project?.id, client?.id, addToast)

  // Drawer state
  const [drawerMode, setDrawerMode] = useState(null) // "new"|"edit"|"details"|null
  const [selected,   setSelected]   = useState(null)

  const closeDrawer = useCallback(() => {
    setDrawerMode(null)
    setSelected(null)
  }, [])

  // Save handler (create or edit)
  const handleSave = useCallback(async (form) => {
    if (drawerMode === "edit" && selected) {
      await editPayment(selected.id, form)
    } else {
      await addPayment(form)
    }
    closeDrawer()
  }, [drawerMode, selected, editPayment, addPayment, closeDrawer])

  const handleMarkPaid = useCallback(async (id) => {
    await markPaid(id)
    closeDrawer()
  }, [markPaid, closeDrawer])

  if (!project) {
    return (
      <div style={{
        background: "#111520", border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 12, padding: "72px 0", textAlign: "center",
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
        <div style={{ fontSize: 14, color: "#5a6478" }}>Selecione um projeto</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes shimmer { to { background-position: -400% 0; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>

      <ProjectFinanceOverview
        finance={finance}
        payments={payments}
        loading={loading}
        projectName={project.name}
        onSetupFinance={setupFinance}
        onUpdateFinance={updateFinance}
        onNewPayment={() => { setSelected(null); setDrawerMode("new") }}
        onViewPayment={(p) => { setSelected(p); setDrawerMode("details") }}
        onMarkPaid={markPaid}
        onEditPayment={(p) => { setSelected(p); setDrawerMode("edit") }}
        onDuplicatePayment={duplicatePayment}
        onDeletePayment={removePayment}
      />

      <PaymentDrawer
        mode={drawerMode}
        payment={selected}
        projectName={project.name}
        onSave={handleSave}
        onMarkPaid={handleMarkPaid}
        onClose={closeDrawer}
      />
    </>
  )
}