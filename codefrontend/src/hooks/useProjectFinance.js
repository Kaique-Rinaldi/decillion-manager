// src/hooks/useProjectFinance.js
import { useState, useEffect, useCallback, useRef } from "react"
import {
  fetchProjectFinanceByClient,
  fetchPaymentsByFinance,
  ensureProjectFinance,
  updateProjectFinance,
  createPayment,
  updatePayment,
  markPaymentPaid,
  deletePayment,
  fetchProjectFinance_byId,
} from "../services/financeService"

/**
 * Hook de financeiro vinculado diretamente ao cliente.
 *
 * Arquitetura:  Cliente → Financeiro → Pagamentos
 *
 * ✅ Zero dependência da tabela `projects`
 * ✅ Zero inserts automáticos em `projects`
 * ✅ client_id é o único vínculo necessário
 */
export function useProjectFinance(clientId, addToast) {
  const [finance,  setFinance]  = useState(null)
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const settingUpRef = useRef(false)

  // ── Load ───────────────────────────────────────────────────
  // Busca o financeiro pelo client_id.
  // Se não existir ainda, finance fica null (sem criar nada automaticamente).
  const load = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    setError(null)
    try {
      const fin = await fetchProjectFinanceByClient(clientId)
      setFinance(fin)

      if (fin) {
        const pays = await fetchPaymentsByFinance(fin.id)
        setPayments(pays)
      } else {
        setPayments([])
      }
    } catch (err) {
      setError(err)
      addToast?.("Erro ao carregar financeiro.", "error")
    } finally {
      setLoading(false)
    }
  }, [clientId]) // eslint-disable-line

  useEffect(() => { load() }, [load])

  // ── Setup Finance ──────────────────────────────────────────
  // Cria o financeiro para o cliente se ainda não existir.
  const setupFinance = useCallback(async (payload) => {
    if (finance) {
      addToast?.("Financeiro já configurado para este cliente.", "info")
      return
    }
    if (settingUpRef.current) return
    settingUpRef.current = true
    setLoading(true)

    try {
      const { data, alreadyExisted } = await ensureProjectFinance(clientId, payload)

      setFinance(data)

      const pays = await fetchPaymentsByFinance(data.id)
      setPayments(pays)

      addToast?.(
        alreadyExisted
          ? "Financeiro já configurado para este cliente."
          : "Financeiro configurado!",
        alreadyExisted ? "info" : "success"
      )
    } catch (err) {
      console.error("[setupFinance] erro:", err)
      addToast?.("Erro ao configurar financeiro. Tente novamente.", "error")
    } finally {
      settingUpRef.current = false
      setLoading(false)
    }
  }, [finance, clientId]) // eslint-disable-line

  // ── Update Finance ─────────────────────────────────────────
  const updateFinance = useCallback(async (payload) => {
    if (!finance) return
    try {
      const fin = await updateProjectFinance(finance.id, payload)
      setFinance(fin)
      addToast?.("Financeiro atualizado!", "success")
    } catch {
      addToast?.("Erro ao atualizar financeiro.", "error")
    }
  }, [finance]) // eslint-disable-line

  // ── Refresh Finance ────────────────────────────────────────
  const refreshFinance = useCallback(async () => {
    if (!finance) return
    try {
      const fin = await fetchProjectFinance_byId(finance.id)
      setFinance(fin)
    } catch { /* silent */ }
  }, [finance])

  // ── Add Payment ────────────────────────────────────────────
  const addPayment = useCallback(async (form) => {
    if (!finance) return
    try {
      const pay = await createPayment(finance.id, form)
      setPayments(prev =>
        [...prev, pay].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
      )
      await refreshFinance()
      addToast?.("Pagamento criado!", "success")
      return pay
    } catch {
      addToast?.("Erro ao criar pagamento.", "error")
    }
  }, [finance, refreshFinance]) // eslint-disable-line

  // ── Edit Payment ───────────────────────────────────────────
  const editPayment = useCallback(async (id, form) => {
    try {
      const pay = await updatePayment(id, form)
      setPayments(prev => prev.map(p => p.id === id ? pay : p))
      await refreshFinance()
      addToast?.("Pagamento atualizado!", "success")
      return pay
    } catch {
      addToast?.("Erro ao atualizar pagamento.", "error")
    }
  }, [refreshFinance]) // eslint-disable-line

  // ── Mark Paid ──────────────────────────────────────────────
  const markPaid = useCallback(async (paymentId) => {
    if (!finance) return
    try {
      const { payment, finance: updatedFin } = await markPaymentPaid(paymentId, finance.id)
      setPayments(prev => prev.map(p => p.id === paymentId ? payment : p))
      setFinance(updatedFin)
      addToast?.("Pagamento marcado como pago! ✓", "success")
    } catch {
      addToast?.("Erro ao marcar pagamento.", "error")
    }
  }, [finance]) // eslint-disable-line

  // ── Remove Payment ─────────────────────────────────────────
  const removePayment = useCallback(async (id) => {
    try {
      await deletePayment(id)
      setPayments(prev => prev.filter(p => p.id !== id))
      await refreshFinance()
      addToast?.("Pagamento removido.", "warning")
    } catch {
      addToast?.("Erro ao excluir pagamento.", "error")
    }
  }, [refreshFinance]) // eslint-disable-line

  // ── Duplicate Payment ──────────────────────────────────────
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
      setPayments(prev =>
        [...prev, pay].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
      )
      addToast?.("Pagamento duplicado!", "success")
    } catch {
      addToast?.("Erro ao duplicar pagamento.", "error")
    }
  }, [finance]) // eslint-disable-line

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