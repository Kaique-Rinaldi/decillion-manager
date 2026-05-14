// src/hooks/useProjectFinance.js
// Hook central para gestão financeira de um projeto.
// Encapsula fetch, create, update, markPaid, delete com sync automático.

import { useState, useEffect, useCallback } from "react"
import {
  fetchProjectFinance,
  fetchPaymentsByFinance,
  createProjectFinance,
  updateProjectFinance,
  createPayment,
  updatePayment,
  markPaymentPaid,
  deletePayment,
  fetchProjectFinance_byId,
} from "../services/financeService"

export function useProjectFinance(projectId, clientId, addToast) {
  const [finance,  setFinance]  = useState(null)
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  // ── Load ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const fin = await fetchProjectFinance(projectId)
      setFinance(fin)
      if (fin) {
        const pays = await fetchPaymentsByFinance(fin.id)
        setPayments(pays)
      } else {
        setPayments([])
      }
    } catch (err) {
      setError(err)
      addToast?.("Erro ao carregar financeiro do projeto.", "error")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  // ── Setup Finance ─────────────────────────────────────────────
  const setupFinance = useCallback(async (payload) => {
    try {
      const fin = await createProjectFinance(clientId, projectId, payload)
      setFinance(fin)
      setPayments([])
      addToast?.("Financeiro configurado!", "success")
    } catch {
      addToast?.("Erro ao configurar financeiro.", "error")
    }
  }, [clientId, projectId])

  // ── Update Finance ────────────────────────────────────────────
  const updateFinance = useCallback(async (payload) => {
    if (!finance) return
    try {
      const fin = await updateProjectFinance(finance.id, payload)
      setFinance(fin)
      addToast?.("Financeiro atualizado!", "success")
    } catch {
      addToast?.("Erro ao atualizar financeiro.", "error")
    }
  }, [finance])

  // ── Refresh Finance (after payment changes) ───────────────────
  const refreshFinance = useCallback(async () => {
    if (!finance) return
    try {
      const fin = await fetchProjectFinance_byId(finance.id)
      setFinance(fin)
    } catch { /* silent */ }
  }, [finance])

  // ── Create Payment ────────────────────────────────────────────
  const addPayment = useCallback(async (form) => {
    if (!finance) return
    try {
      const pay = await createPayment(finance.id, form)
      setPayments((prev) => [...prev, pay].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")))
      await refreshFinance()
      addToast?.("Pagamento criado!", "success")
      return pay
    } catch {
      addToast?.("Erro ao criar pagamento.", "error")
    }
  }, [finance, refreshFinance])

  // ── Update Payment ────────────────────────────────────────────
  const editPayment = useCallback(async (id, form) => {
    try {
      const pay = await updatePayment(id, form)
      setPayments((prev) => prev.map((p) => (p.id === id ? pay : p)))
      await refreshFinance()
      addToast?.("Pagamento atualizado!", "success")
      return pay
    } catch {
      addToast?.("Erro ao atualizar pagamento.", "error")
    }
  }, [refreshFinance])

  // ── Mark Paid ─────────────────────────────────────────────────
  const markPaid = useCallback(async (paymentId) => {
    if (!finance) return
    try {
      const { payment, finance: updatedFin } = await markPaymentPaid(paymentId, finance.id)
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? payment : p)))
      setFinance(updatedFin)
      addToast?.("Pagamento marcado como pago! ✓", "success")
    } catch {
      addToast?.("Erro ao marcar pagamento.", "error")
    }
  }, [finance])

  // ── Delete Payment ────────────────────────────────────────────
  const removePayment = useCallback(async (id) => {
    try {
      await deletePayment(id)
      setPayments((prev) => prev.filter((p) => p.id !== id))
      await refreshFinance()
      addToast?.("Pagamento removido.", "warning")
    } catch {
      addToast?.("Erro ao excluir pagamento.", "error")
    }
  }, [refreshFinance])

  // ── Duplicate Payment ─────────────────────────────────────────
  const duplicatePayment = useCallback(async (payment) => {
    if (!finance) return
    try {
      const pay = await createPayment(finance.id, {
        title:          payment.title + " (cópia)",
        description:    payment.description,
        amount:         payment.amount,
        payment_method: payment.payment_method,
        status:         "pending",
        due_date:       "",
        notes:          payment.notes,
      })
      setPayments((prev) => [...prev, pay].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")))
      addToast?.("Pagamento duplicado!", "success")
    } catch {
      addToast?.("Erro ao duplicar pagamento.", "error")
    }
  }, [finance])

  return {
    finance,
    payments,
    loading,
    error,
    reload:           load,
    setupFinance,
    updateFinance,
    addPayment,
    editPayment,
    markPaid,
    removePayment,
    duplicatePayment,
  }
}