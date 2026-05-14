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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Classifica erros de conflito/duplicidade vindos do Supabase ou fetch.
 */
function isConflictError(err) {
  if (!err) return false
  const code    = err?.code    ?? ""
  const message = (err?.message ?? err?.details ?? "").toLowerCase()
  return (
    code === "23505"               ||
    code === "409"                 ||
    message.includes("duplicate") ||
    message.includes("unique")    ||
    message.includes("conflict")  ||
    message.includes("already exists")
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProjectFinance(projectId, clientId, addToast) {
  const [finance,  setFinance]  = useState(null)
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  // ── Load ───────────────────────────────────────────────────────────────────
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
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  // ── Setup Finance ──────────────────────────────────────────────────────────
  /**
   * Cria ou recupera o financeiro do projeto.
   *
   * Fluxo:
   *   1. Chama createProjectFinance (que internamente faz fetch-first)
   *   2. Se retornou `_alreadyExisted: true` → o finance já existia; apenas
   *      carrega os dados sem exibir erro
   *   3. Se criou com sucesso → toast de confirmação
   *   4. Qualquer outro erro → toast de erro + não altera estado
   */
  const setupFinance = useCallback(async (payload) => {
    // Bloqueia criação dupla se o finance já está no estado local
    if (finance) {
      addToast?.("Financeiro já configurado para este projeto.", "info")
      return
    }

    setLoading(true)
    try {
      const result = await createProjectFinance(clientId, projectId, payload)

      if (result._alreadyExisted) {
        // ── Finance já existia: carrega silenciosamente ──
        // Remove a flag interna antes de salvar no estado
        const { _alreadyExisted, ...cleanFinance } = result
        setFinance(cleanFinance)

        // Carrega os pagamentos existentes
        const pays = await fetchPaymentsByFinance(cleanFinance.id)
        setPayments(pays)

        addToast?.(
          "Financeiro já configurado para este projeto.",
          "info"
        )
      } else {
        // ── Finance criado com sucesso ──
        setFinance(result)
        setPayments([])
        addToast?.("Financeiro configurado!", "success")
      }
    } catch (err) {
      // Último recurso: se mesmo após fetch-first ainda veio 409, tenta carregar
      if (isConflictError(err)) {
        try {
          const existing = await fetchProjectFinance(projectId)
          if (existing) {
            setFinance(existing)
            const pays = await fetchPaymentsByFinance(existing.id)
            setPayments(pays)
            addToast?.(
              "Financeiro já configurado para este projeto.",
              "info"
            )
            return
          }
        } catch {
          // Se o fallback também falhar, cai no erro genérico abaixo
        }
      }
      addToast?.("Erro ao configurar financeiro.", "error")
    } finally {
      setLoading(false)
    }
  }, [finance, clientId, projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update Finance ─────────────────────────────────────────────────────────
  const updateFinance = useCallback(async (payload) => {
    if (!finance) return
    try {
      const fin = await updateProjectFinance(finance.id, payload)
      setFinance(fin)
      addToast?.("Financeiro atualizado!", "success")
    } catch {
      addToast?.("Erro ao atualizar financeiro.", "error")
    }
  }, [finance]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Refresh Finance (after payment changes) ────────────────────────────────
  const refreshFinance = useCallback(async () => {
    if (!finance) return
    try {
      const fin = await fetchProjectFinance_byId(finance.id)
      setFinance(fin)
    } catch { /* silent */ }
  }, [finance])

  // ── Create Payment ─────────────────────────────────────────────────────────
  const addPayment = useCallback(async (form) => {
    if (!finance) return
    try {
      const pay = await createPayment(finance.id, form)
      setPayments((prev) =>
        [...prev, pay].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
      )
      await refreshFinance()
      addToast?.("Pagamento criado!", "success")
      return pay
    } catch {
      addToast?.("Erro ao criar pagamento.", "error")
    }
  }, [finance, refreshFinance]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update Payment ─────────────────────────────────────────────────────────
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
  }, [refreshFinance]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mark Paid ──────────────────────────────────────────────────────────────
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
  }, [finance]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Delete Payment ─────────────────────────────────────────────────────────
  const removePayment = useCallback(async (id) => {
    try {
      await deletePayment(id)
      setPayments((prev) => prev.filter((p) => p.id !== id))
      await refreshFinance()
      addToast?.("Pagamento removido.", "warning")
    } catch {
      addToast?.("Erro ao excluir pagamento.", "error")
    }
  }, [refreshFinance]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Duplicate Payment ──────────────────────────────────────────────────────
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
      setPayments((prev) =>
        [...prev, pay].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
      )
      addToast?.("Pagamento duplicado!", "success")
    } catch {
      addToast?.("Erro ao duplicar pagamento.", "error")
    }
  }, [finance]) // eslint-disable-line react-hooks/exhaustive-deps

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